"use client";

import Image from "next/image";
import type { PropertyImage } from "@/types";

interface GalleryGridProps {
  images: PropertyImage[];
  title: string;
  onOpenLightbox: (index: number) => void;
  onOpenAllPhotos: () => void;
}

export default function GalleryGrid({ images, title, onOpenLightbox, onOpenAllPhotos }: GalleryGridProps) {
  const gridImages = images.slice(0, 5);
  const totalCount = images.length;
  const hasMultiple = totalCount > 1;

  return (
    <>
      {/* Mobile: single hero + show all */}
      <div className="md:hidden relative h-[300px] rounded-xl overflow-hidden shadow-2xl shadow-black/5">
        <button
          type="button"
          onClick={() => onOpenLightbox(0)}
          aria-label="Open photo viewer"
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={gridImages[0].url}
            alt={gridImages[0].altText || title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 0px, 100vw"
          />
        </button>
        {hasMultiple && (
          <>
            <div className="pointer-events-none absolute bottom-4 left-4 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">photo_library</span>
              {totalCount} photos
            </div>
            <button
              type="button"
              onClick={onOpenAllPhotos}
              className="absolute bottom-4 right-4 bg-surface px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-outline-variant/20 shadow-sm hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              Show all
            </button>
          </>
        )}
      </div>

      {/* Desktop: 4-col 2-row grid */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[500px] rounded-xl overflow-hidden shadow-2xl shadow-black/5">
        {gridImages.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOpenLightbox(i)}
            aria-label={`View photo ${i + 1} of ${totalCount}`}
            className={`relative group overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
          >
            <Image
              src={img.url}
              alt={img.altText || `${title} photo ${i + 1}`}
              fill
              className="object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-105"
              sizes={i === 0 ? "50vw" : "25vw"}
              priority={i === 0}
            />
            {/* Hover affordance */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
              <span className="material-symbols-outlined text-white text-lg bg-black/50 backdrop-blur rounded-full p-1.5">
                zoom_in
              </span>
            </div>
            {/* "Show all photos" lives on the last cell, only when there are extras */}
            {i === gridImages.length - 1 && hasMultiple && (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAllPhotos();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenAllPhotos();
                  }
                }}
                aria-label={`Show all ${totalCount} photos`}
                className="absolute bottom-4 right-4 bg-surface px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-outline-variant/20 shadow-sm hover:bg-surface-container transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
                Show all {totalCount} photos
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
