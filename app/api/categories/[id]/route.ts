import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { categoryInputSchema } from "../schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return jsonError("Category not found", 404);
  return NextResponse.json(category);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = categoryInputSchema.partial().safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const category = await prisma.category
    .update({ where: { id }, data: parsed.data })
    .catch(() => null);
  if (!category) return jsonError("Category not found", 404);
  return NextResponse.json(category);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return jsonError(
      `Cannot delete: ${productCount} product(s) still reference this category`,
      409
    );
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025")) {
      return jsonError("Failed to delete category", 500);
    }
  }
  return new NextResponse(null, { status: 204 });
}
