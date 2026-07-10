import { z } from "zod";

export const productInputSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().min(1),
    priceType: z.enum(["FIXED", "QUOTE"]),
    price: z.number().positive().nullable().optional(),
    currency: z.string().min(1).max(10).optional(),
    sizes: z.string().max(300).optional(),
    colours: z.string().max(300).optional(),
    leadTime: z.string().max(200).optional(),
    imageUrl: z.string().url().optional(),
    imagePublicId: z.string().optional(),
    featured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    categoryId: z.string().min(1),
  })
  .refine(
    (data) => data.priceType !== "FIXED" || (data.price !== null && data.price !== undefined),
    { message: "price is required when priceType is FIXED", path: ["price"] }
  );

// PATCH allows partial updates; the FIXED/price relationship is still worth
// keeping easy to check, so this mirrors the create schema's field set but
// makes every field optional (including priceType/price together).
export const productUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    priceType: z.enum(["FIXED", "QUOTE"]).optional(),
    price: z.number().positive().nullable().optional(),
    currency: z.string().min(1).max(10).optional(),
    sizes: z.string().max(300).optional(),
    colours: z.string().max(300).optional(),
    leadTime: z.string().max(200).optional(),
    imageUrl: z.string().url().optional(),
    imagePublicId: z.string().optional(),
    featured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    categoryId: z.string().min(1).optional(),
  })
  .refine(
    (data) => data.priceType !== "FIXED" || data.price !== null,
    { message: "price cannot be null when priceType is FIXED", path: ["price"] }
  );
