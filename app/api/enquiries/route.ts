import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { enquiryInputSchema } from "./schema";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`enquiry:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return jsonError("Too many requests, please try again later", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = enquiryInputSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  // Honeypot passed validation (must be empty or absent) — never persist it.
  const { website: _honeypot, ...data } = parsed.data;

  const enquiry = await prisma.enquiry.create({ data });
  return NextResponse.json(enquiry, { status: 201 });
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(enquiries);
}
