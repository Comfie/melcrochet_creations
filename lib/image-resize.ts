export const MAX_IMAGE_DIMENSION = 2000;
export const IMAGE_QUALITY = 0.85;
export const SKIP_RESIZE_BYTES = 2 * 1024 * 1024;

export function computeResizedDimensions(
  width: number,
  height: number,
  maxDimension: number = MAX_IMAGE_DIMENSION
): { width: number; height: number; scale: number } {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
  };
}

export async function resizeImageIfNeeded(file: File): Promise<File> {
  if (typeof createImageBitmap === "undefined") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const { width, height, scale } = computeResizedDimensions(
    bitmap.width,
    bitmap.height
  );

  if (scale === 1 && file.size <= SKIP_RESIZE_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType =
    file.type === "image/png" || file.type === "image/webp"
      ? file.type
      : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outputType, IMAGE_QUALITY)
  );
  if (!blob) return file;

  const name =
    outputType === file.type
      ? file.name
      : file.name.replace(/\.[^.]+$/, "") + ".jpg";

  return new File([blob], name, { type: outputType });
}
