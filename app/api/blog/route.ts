import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { blogPostInputSchema } from "./schema";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let n = 2;
  while (await prisma.blogPost.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = blogPostInputSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const slug = await uniqueSlug(parsed.data.title);
  try {
    const post = await prisma.blogPost.create({
      data: {
        ...parsed.data,
        slug,
        publishedAt: parsed.data.published ? new Date() : null,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("A blog post with this slug already exists", 409);
    }
    throw error;
  }
}
