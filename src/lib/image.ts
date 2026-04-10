import sharp from "sharp";

/**
 * Generate a WebP thumbnail from an image buffer.
 * @returns WebP buffer at 400px width, maintaining aspect ratio, quality 80
 */
export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}
