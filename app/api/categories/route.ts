import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireAuth } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { categoryInputSchema } from "./schema";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
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
  // New categories go to the end of the list unless an order is given.
  const sortOrder =
    parsed.data.sortOrder ??
    ((await prisma.category.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? -1) + 1;
  try {
    const category = await prisma.category.create({
      data: { ...parsed.data, sortOrder, slug },
    });
    revalidatePublicSite();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("A category with this name already exists", 409);
    }
    throw error;
  }
}
