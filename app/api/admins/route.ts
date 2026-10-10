import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireOwner, PUBLIC_USER_SELECT } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { adminCreateSchema } from "./schema";

export async function GET(request: NextRequest) {
  const { response } = await requireOwner(request);
  if (response) return response;

  const admins = await prisma.adminUser.findMany({
    select: PUBLIC_USER_SELECT,
    orderBy: [{ isActive: "desc" }, { role: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(admins);
}

export async function POST(request: NextRequest) {
  const { response } = await requireOwner(request);
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = adminCreateSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const { password, ...data } = parsed.data;
  try {
    const admin = await prisma.adminUser.create({
      data: { ...data, email: data.email ?? null, passwordHash: await bcrypt.hash(password, 10) },
      select: PUBLIC_USER_SELECT,
    });
    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("That username is already taken", 409);
    }
    throw error;
  }
}
