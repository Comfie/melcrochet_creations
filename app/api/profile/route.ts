import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession, PUBLIC_USER_SELECT } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { profileUpdateSchema } from "./schema";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return jsonError("Unauthorized", 401);
  const user = await prisma.adminUser.findUnique({ where: { id: session.user.id }, select: PUBLIC_USER_SELECT });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  try {
    const user = await prisma.adminUser.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: PUBLIC_USER_SELECT,
    });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("That username is already taken", 409);
    }
    throw error;
  }
}
