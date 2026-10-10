import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { categoryOrderSchema } from "../schema";

/** Saves a new display order: each category's sortOrder becomes its index. */
export async function PUT(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = categoryOrderSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const { ids } = parsed.data;
  const found = await prisma.category.count({ where: { id: { in: ids } } });
  if (found !== new Set(ids).size || found !== ids.length) {
    return jsonError("Unknown or duplicate category in the new order", 400);
  }

  await prisma.$transaction(
    ids.map((id, index) => prisma.category.update({ where: { id }, data: { sortOrder: index } }))
  );
  revalidatePublicSite();
  return NextResponse.json({ ok: true });
}
