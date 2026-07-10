import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { productInputSchema } from "./schema";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(products);
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const slug = await uniqueSlug(parsed.data.name);
  try {
    const product = await prisma.product.create({
      data: { ...parsed.data, slug },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return jsonError("A product with this slug already exists", 409);
      }
      if (error.code === "P2003") {
        return jsonError("Category does not exist", 400);
      }
    }
    throw error;
  }
}
