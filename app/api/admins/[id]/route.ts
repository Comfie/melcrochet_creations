import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireOwner, PUBLIC_USER_SELECT } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { adminUpdateSchema } from "../schema";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Owner edits a team member: name, email, role, active, or a password
 * reset. Admins are never hard-deleted — deactivating keeps their record.
 * Deactivating or resetting a password signs that person out everywhere.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, response } = await requireOwner(request);
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = adminUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return jsonError("Admin not found", 404);

  const { password, ...changes } = parsed.data;
  const isSelf = target.id === session.user.id;

  if (isSelf && changes.isActive === false) {
    return jsonError("You can't deactivate your own account", 400);
  }
  if (isSelf && changes.role && changes.role !== target.role) {
    return jsonError("You can't change your own role", 400);
  }

  const losesOwner =
    target.role === "OWNER" && (changes.role === "ADMIN" || changes.isActive === false);
  if (losesOwner) {
    const otherOwners = await prisma.adminUser.count({
      where: { role: "OWNER", isActive: true, id: { not: target.id } },
    });
    if (otherOwners === 0) return jsonError("The site needs at least one active owner", 400);
  }

  const signOut = password !== undefined || (changes.isActive === false && target.isActive);
  const admin = await prisma.adminUser.update({
    where: { id },
    data: {
      ...changes,
      ...(password !== undefined ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      ...(signOut ? { tokenVersion: { increment: 1 } } : {}),
    },
    select: PUBLIC_USER_SELECT,
  });
  return NextResponse.json(admin);
}
