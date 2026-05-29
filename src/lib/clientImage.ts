const THUMB_WIDTH = 400;
const THUMB_QUALITY = 0.8;

/**
 * Generate a 400px-wide WebP thumbnail in the browser, preserving aspect ratio
 * and never enlarging images already narrower than 400px. EXIF orientation is
 * honored so rotated phone photos come out upright.
 */
export async function generateThumbnailBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, THUMB_WIDTH / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", THUMB_QUALITY)
    );
    if (!blob) throw new Error("Thumbnail encoding failed");
    return blob;
  } finally {
    bitmap.close();
  }
}
