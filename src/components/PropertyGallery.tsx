"use client";

import { useState } from "react";
import Image from "next/image";
import type { PropertyImage } from "@/types";
import GalleryGrid from "./gallery/GalleryGrid";
import GalleryLightbox from "./gallery/GalleryLightbox";
import GalleryAllPhotos from "./gallery/GalleryAllPhotos";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

type Mode = "closed" | "allPhotos" | "lightbox";

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [mode, setMode] = useState<Mode>("closed");
  const [activeIndex, setActiveIndex] = useState(0);

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

  const openLightboxAt = (i: number) => {
    setActiveIndex(i);
    setMode("lightbox");
  };

  const openAllPhotos = () => setMode("allPhotos");

  const onPhotoClickInAllPhotos = (i: number) => {
    setActiveIndex(i);
    setMode("lightbox");
  };

  return (
    <section className="mb-12">
      <GalleryGrid
        images={images}
        title={title}
        onOpenLightbox={openLightboxAt}
        onOpenAllPhotos={openAllPhotos}
      />

      <GalleryLightbox
        images={images}
        title={title}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        open={mode === "lightbox"}
        onOpenChange={(o) => {
          if (!o) setMode("closed");
        }}
      />

      <GalleryAllPhotos
        images={images}
        title={title}
        open={mode === "allPhotos"}
        onOpenChange={(o) => {
          if (!o) setMode("closed");
        }}
        onPhotoClick={onPhotoClickInAllPhotos}
      />
    </section>
  );
}
