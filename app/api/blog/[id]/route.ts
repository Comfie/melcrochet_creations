import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";
import { blogPostUpdateSchema } from "../schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return jsonError("Post not found", 404);
  return NextResponse.json(post);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = blogPostUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return jsonError("Post not found", 404);

  const imageIsReplaced =
    parsed.data.coverImagePublicId !== undefined &&
    parsed.data.coverImagePublicId !== existing.coverImagePublicId &&
    existing.coverImagePublicId;

  const justPublished = parsed.data.published === true && !existing.publishedAt;

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(justPublished ? { publishedAt: new Date() } : {}),
    },
  });

  if (imageIsReplaced && existing.coverImagePublicId) {
    await deleteImage(existing.coverImagePublicId);
  }

  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } }).catch(() => null);
  return new NextResponse(null, { status: 204 });
}
