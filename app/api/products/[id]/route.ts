import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";
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

  const imageIsReplaced =
    parsed.data.imagePublicId !== undefined &&
    parsed.data.imagePublicId !== existing.imagePublicId &&
    existing.imagePublicId;

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  if (imageIsReplaced && existing.imagePublicId) {
    await deleteImage(existing.imagePublicId);
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
