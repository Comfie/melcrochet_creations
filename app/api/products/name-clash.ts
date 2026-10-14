import prisma from "@/lib/prisma";
import { jsonError } from "@/lib/api-response";

/**
 * A product's name is its page title (see productTitle in lib/seo.ts), so two
 * active products with the same name publish two pages with the same title —
 * shoppers can't tell them apart and the pages compete in search. Returns a
 * 409 response when another active product already uses `name`.
 */
export async function productNameClash(name: string, excludeId?: string) {
  const clash = await prisma.product.findFirst({
    where: {
      isActive: true,
      name: { equals: name.trim(), mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (!clash) return null;
  return jsonError(
    `Another product is already called “${name.trim()}”. Give this one a distinct name (for example its colour, size or style) so shoppers and Google can tell them apart.`,
    409
  );
}
