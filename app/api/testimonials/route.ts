import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonValidationError } from "@/lib/api-response";
import { testimonialInputSchema } from "./schema";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(testimonials);
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = testimonialInputSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const testimonial = await prisma.testimonial.create({ data: parsed.data });
  return NextResponse.json(testimonial, { status: 201 });
}
