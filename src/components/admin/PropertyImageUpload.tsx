"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import type { PropertyImage } from "@/types";

interface PropertyImageUploadProps {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}

async function friendlyUploadError(res: Response): Promise<string> {
  // Try to read a JSON error message from our API first.
  try {
    const json = await res.clone().json();
    if (json?.error) return json.error as string;
  } catch {
    // Fall through to status-based message.
  }

  if (res.status === 401 || res.status === 403) {
    return "Your session expired. Please sign in and try again.";
  }
  if (res.status === 413) {
    return "Image is too large to upload. Please use a smaller file.";
  }
  if (res.status >= 500) {
    // Vercel/edge errors return a plain-text page (with an error ID) rather than JSON.
    return "Upload failed. The image may be too large, or the server is temporarily unavailable. Please try a smaller image or try again in a moment.";
  }
  return "Upload failed. Please try again.";
}

export default function PropertyImageUpload({ images, onChange }: PropertyImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError("");
      setUploading(true);

      const fileArray = Array.from(files);

      try {
        const urlRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: fileArray.map((f) => ({ name: f.name, type: f.type, size: f.size })),
          }),
        });
        if (!urlRes.ok) {
          setError(await friendlyUploadError(urlRes));
          return;
        }
        const { uploads } = (await urlRes.json()) as {
          uploads: { key: string; uploadUrl: string; publicUrl: string }[];
        };

        const results = await Promise.all(
          uploads.map(async (u, i) => {
            const file = fileArray[i];
            const putRes = await fetch(u.uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });
            if (!putRes.ok) {
              throw new Error(`Upload to storage failed for "${file.name}".`);
            }

            const thumbRes = await fetch("/api/thumbnail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: u.key }),
            });
            const thumbnailUrl = thumbRes.ok
              ? ((await thumbRes.json()) as { thumbnailUrl: string }).thumbnailUrl
              : u.publicUrl;

            return { url: u.publicUrl, thumbnailUrl };
          })
        );

        const nextOrder = images.length;
        const newImages: PropertyImage[] = results.map((r, i) => ({
          url: r.url,
          thumbnailUrl: r.thumbnailUrl,
          altText: "",
          order: nextOrder + i,
        }));

        onChange([...images, ...newImages]);
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : "Couldn't reach the server. Check your connection and try again.");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function handleRemove(index: number) {
    const updated = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }));
    onChange(updated);
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated.map((img, i) => ({ ...img, order: i })));
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">Images</h2>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-gray-900 bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3.75 3.75 0 013.57 5.305A3 3 0 0118 19.5H6.75z" />
        </svg>
        <p className="text-sm text-gray-600">
          {uploading ? "Uploading..." : "Drag & drop images here, or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 10MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              uploadFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={`${img.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIndex !== null) {
                  handleReorder(dragIndex, index);
                  setDragIndex(null);
                }
              }}
              className={`relative group aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-grab active:cursor-grabbing ${
                dragIndex === index ? "opacity-50" : ""
              }`}
            >
              <Image
                src={img.thumbnailUrl || img.url}
                alt={img.altText || `Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />

              {/* Order badge */}
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded">
                  Cover
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p className="text-xs text-gray-400">Drag images to reorder. First image is the cover photo.</p>
      )}
    </section>
  );
}
