"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import type { PropertyImage } from "@/types";
import { useSwipe } from "@/hooks/useSwipe";

interface GalleryLightboxProps {
  images: PropertyImage[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

export default function GalleryLightbox({
  images,
  activeIndex,
  onIndexChange,
  open,
  onOpenChange,
  title,
}: GalleryLightboxProps) {
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

  // Auto-scroll active thumb into view
  const thumbStripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const strip = thumbStripRef.current;
    if (!strip) return;
    const active = strip.querySelector<HTMLElement>(`[data-thumb-index="${activeIndex}"]`);
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex, open]);

  const swipe = useSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  });

  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    if (swipe.didSwipe()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) goPrev();
    else goNext();
  };

  // Render triplet: prev, current, next (preloads neighbors)
  const triplet = images.length > 1
    ? [
        (activeIndex - 1 + images.length) % images.length,
        activeIndex,
        (activeIndex + 1) % images.length,
      ]
    : [activeIndex];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black z-[60]" />
        <Dialog.Content
          className="fixed inset-0 z-[60] grid grid-cols-1 grid-rows-[auto_1fr_auto] outline-none bg-black"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{title} — photo viewer</Dialog.Title>

          {/* Header */}
          <header className="flex items-center justify-between px-4 md:px-6 py-3 z-20">
            <div className="text-white text-sm font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur">
              {activeIndex + 1} / {images.length}
            </div>
            <Dialog.Close
              aria-label="Close photo viewer"
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </Dialog.Close>
          </header>

          {/* Stage */}
          <div className="relative overflow-hidden">
            {/* Image triplet (base layer) */}
            <div className="absolute inset-0">
              {triplet.map((i) => (
                <div
                  key={i}
                  className={`absolute inset-0 flex items-center justify-center motion-safe:transition-opacity motion-safe:duration-150 ${
                    i === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  aria-hidden={i !== activeIndex}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={images[i].url}
                      alt={images[i].altText || `${title} photo ${i + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={i === activeIndex}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Click + swipe layer (under chevron pills) */}
            {images.length > 1 && (
              <div
                role="presentation"
                onClick={onStageClick}
                {...swipe.handlers}
                style={{ touchAction: "pan-y" }}
                className="absolute inset-0 z-10 select-none"
              />
            )}

            {/* Chevron pills */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous photo"
                  className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next photo"
                  className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Footer: thumbnails + keyboard hint */}
          {images.length > 1 && (
            <footer className="z-20 pb-2">
              <div
                ref={thumbStripRef}
                className="flex gap-2 overflow-x-auto px-4 md:px-6 py-3 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    data-thumb-index={i}
                    onClick={() => onIndexChange(i)}
                    aria-label={`View photo ${i + 1}`}
                    aria-current={i === activeIndex}
                    className={`shrink-0 relative w-16 h-12 md:w-24 md:h-16 rounded overflow-hidden snap-start transition-opacity ${
                      i === activeIndex
                        ? "ring-2 ring-white opacity-100"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.thumbnailUrl || img.url}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
              <div className="hidden md:flex justify-center text-white/50 text-xs pb-1">
                Use ← → to navigate · Esc to close
              </div>
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
