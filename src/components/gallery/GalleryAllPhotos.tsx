"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import type { PropertyImage } from "@/types";

interface GalleryAllPhotosProps {
  images: PropertyImage[];
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoClick: (index: number) => void;
}

export default function GalleryAllPhotos({
  images,
  title,
  open,
  onOpenChange,
  onPhotoClick,
}: GalleryAllPhotosProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-surface z-[60]" />
        <Dialog.Content
          className="fixed inset-0 z-[60] bg-surface overflow-y-auto outline-none"
          aria-describedby={undefined}
        >
          <header className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-outline-variant/30 h-14 flex items-center px-4 md:px-8">
            <Dialog.Close
              aria-label="Close photo grid"
              className="h-9 w-9 rounded-full hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </Dialog.Close>
            <Dialog.Title className="ml-3 font-semibold text-on-surface line-clamp-1">
              {title}
            </Dialog.Title>
            <span className="ml-auto text-sm text-on-surface-variant shrink-0">
              {images.length} photos
            </span>
          </header>

          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPhotoClick(i)}
                  aria-label={`View photo ${i + 1} of ${images.length}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg group focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${title} photo ${i + 1}`}
                    fill
                    className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
