import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";
import { testimonialUpdateSchema } from "../schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) return jsonError("Testimonial not found", 404);
  return NextResponse.json(testimonial);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = testimonialUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) return jsonError("Testimonial not found", 404);

  const imageIsReplaced =
    parsed.data.imagePublicId !== undefined &&
    parsed.data.imagePublicId !== existing.imagePublicId &&
    existing.imagePublicId;

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: parsed.data,
  });

  if (imageIsReplaced && existing.imagePublicId) {
    await deleteImage(existing.imagePublicId);
  }

  return NextResponse.json(testimonial);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const testimonial = await prisma.testimonial
    .update({ where: { id }, data: { isActive: false } })
    .catch(() => null);
  if (!testimonial) return jsonError("Testimonial not found", 404);
  return NextResponse.json(testimonial);
}
