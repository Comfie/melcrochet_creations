import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonValidationError } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";
import { referencedPublicIds } from "@/lib/image-references";
import { discardSchema } from "../schema";

/**
 * Deletes photos uploaded in a form that was then cancelled (or whose
 * photo was replaced before saving), so they don't pile up in Cloudinary.
 * Only admin-folder images that nothing in the database uses are deleted.
 */
export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = discardSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const ids = [...new Set(parsed.data.publicIds)];
  const inUse = await referencedPublicIds(ids);
  const deleted: string[] = [];
  for (const id of ids) {
    if (inUse.has(id)) continue;
    await deleteImage(id).then(() => deleted.push(id)).catch(() => {});
  }
  return NextResponse.json({ deleted, kept: [...inUse] });
}
