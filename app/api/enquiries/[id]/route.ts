import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { enquiryStatusSchema } from "../schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = enquiryStatusSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const enquiry = await prisma.enquiry
    .update({ where: { id }, data: parsed.data })
    .catch(() => null);
  if (!enquiry) return jsonError("Enquiry not found", 404);
  return NextResponse.json(enquiry);
}
