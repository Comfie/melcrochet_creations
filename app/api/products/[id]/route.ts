import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";
import { parseGallery } from "@/lib/product-gallery";
import { productUpdateSchema } from "../schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return jsonError("Product not found", 404);
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found", 404);

  const effectiveIsActive = parsed.data.isActive ?? existing.isActive;
  const effectiveImageUrl =
    parsed.data.imageUrl !== undefined ? parsed.data.imageUrl : existing.imageUrl;
  if (effectiveIsActive && !effectiveImageUrl) {
    return jsonError(
      "Add at least one image before making this product active",
      400
    );
  }

  const imageIsReplaced =
    parsed.data.imagePublicId !== undefined &&
    parsed.data.imagePublicId !== existing.imagePublicId &&
    existing.imagePublicId;

  const existingGallery = parseGallery(existing.gallery);
  const removedGalleryPublicIds =
    parsed.data.gallery !== undefined
      ? existingGallery
          .filter((img) => !parsed.data.gallery!.some((next) => next.publicId === img.publicId))
          .map((img) => img.publicId)
      : [];

  let product;
  try {
    product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return jsonError("Category does not exist", 400);
    }
    throw error;
  }

  if (imageIsReplaced && existing.imagePublicId) {
    await deleteImage(existing.imagePublicId).catch(() => {});
  }
  for (const publicId of removedGalleryPublicIds) {
    await deleteImage(publicId).catch(() => {});
  }

  return NextResponse.json(product);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const product = await prisma.product
    .update({ where: { id }, data: { isActive: false } })
    .catch(() => null);
  if (!product) return jsonError("Product not found", 404);
  return NextResponse.json(product);
}
