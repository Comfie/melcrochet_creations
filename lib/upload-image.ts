import { resizeImageIfNeeded } from "@/lib/image-resize";

export interface UploadedImage {
  url: string;
  publicId: string;
}

/**
 * Client-side: shrink a phone photo if needed, then send it to
 * POST /api/uploads (Cloudinary). Throws an Error with a user-facing message.
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const uploadable = await resizeImageIfNeeded(file);
  const formData = new FormData();
  formData.append("file", uploadable);

  let res: Response;
  try {
    res = await fetch("/api/uploads", { method: "POST", body: formData });
  } catch {
    throw new Error("Upload failed — check your connection and try again.");
  }

  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Upload failed — the image may be too large. Try a smaller photo.");
  }
  return (await res.json()) as UploadedImage;
}

/** Image types the upload route accepts (iPhone HEIC is converted to JPEG by the OS picker). */
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/avif";
