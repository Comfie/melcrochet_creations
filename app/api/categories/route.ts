import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireAuth } from "@/lib/auth";
import { jsonValidationError } from "@/lib/api-response";
import { categoryInputSchema } from "./schema";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (await prisma.category.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const slug = await uniqueSlug(parsed.data.name);
  const category = await prisma.category.create({
    data: { ...parsed.data, slug },
  });
  return NextResponse.json(category, { status: 201 });
}
