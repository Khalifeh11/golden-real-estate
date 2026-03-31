"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import type { PropertyImage } from "@/types";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

function Lightbox({
  images,
  activeIndex,
  onIndexChange,
  open,
  onOpenChange,
}: {
  images: PropertyImage[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const goPrev = useCallback(() => {
    onIndexChange(activeIndex > 0 ? activeIndex - 1 : images.length - 1);
  }, [activeIndex, images.length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange(activeIndex < images.length - 1 ? activeIndex + 1 : 0);
  }, [activeIndex, images.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goPrev, goNext]);

  const current = images[activeIndex];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/90 z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center outline-none">
          <Dialog.Title className="sr-only">Property photos</Dialog.Title>

          {/* Close */}
          <Dialog.Close className="absolute top-6 right-6 text-white/80 hover:text-white z-10">
            <span className="material-symbols-outlined text-3xl">close</span>
          </Dialog.Close>

          {/* Counter */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium z-10">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
            aria-label="Previous image"
          >
            <span className="material-symbols-outlined text-4xl">chevron_left</span>
          </button>

          {/* Image */}
          <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-16">
            <Image
              src={current.url}
              alt={current.altText || `Photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
            aria-label="Next image"
          >
            <span className="material-symbols-outlined text-4xl">chevron_right</span>
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openAt = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  // No images — placeholder
  if (images.length === 0) {
    return (
      <section className="mb-12">
        <div className="h-[400px] rounded-xl overflow-hidden bg-surface-container flex items-center justify-center">
          <div className="text-center text-outline">
            <span className="material-symbols-outlined text-6xl mb-2 block">image</span>
            <p>No photos available</p>
          </div>
        </div>
      </section>
    );
  }

  // Single image — full width, no lightbox
  if (images.length === 1) {
    return (
      <section className="mb-12">
        <div className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl shadow-black/5">
          <Image
            src={images[0].url}
            alt={images[0].altText || title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </section>
    );
  }

  // Grid — up to 5 images
  const gridImages = images.slice(0, 5);
  const hasMore = images.length > 1;

  return (
    <section className="mb-12">
      {/* Mobile: single hero + show all */}
      <div className="md:hidden relative h-[300px] rounded-xl overflow-hidden shadow-2xl shadow-black/5">
        <Image
          src={gridImages[0].url}
          alt={gridImages[0].altText || title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          onClick={() => openAt(0)}
        />
        {hasMore && (
          <button
            onClick={() => openAt(0)}
            className="absolute bottom-4 right-4 bg-surface px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-outline-variant/20 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">grid_view</span>
            Show all photos
          </button>
        )}
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[500px] rounded-xl overflow-hidden shadow-2xl shadow-black/5">
        {gridImages.map((img, i) => (
          <div
            key={i}
            className={`relative group overflow-hidden cursor-pointer ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
            onClick={() => openAt(i)}
          >
            <Image
              src={img.url}
              alt={img.altText || `${title} photo ${i + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes={i === 0 ? "50vw" : "25vw"}
              priority={i === 0}
            />
            {/* "Show all photos" on last cell */}
            {i === gridImages.length - 1 && hasMore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAt(0);
                }}
                className="absolute bottom-4 right-4 bg-surface px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-outline-variant/20 shadow-sm hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
                Show all photos
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        images={images}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </section>
  );
}
