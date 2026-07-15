import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import { uploadImageBuffer } from "@/lib/cloudinary";

// Vercel Serverless Functions hard-cap request bodies at 4.5MB; stay under
// that with headroom for multipart overhead. Client-side resizing (see
// lib/image-resize.ts) keeps uploads well below this in practice.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("No file provided", 400);
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return jsonError("Unsupported file type", 400);
  }
  if (file.size > MAX_BYTES) {
    return jsonError("File too large (max 4MB)", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { url, publicId } = await uploadImageBuffer(buffer, "melcrochet");

  return NextResponse.json({ url, publicId });
}
