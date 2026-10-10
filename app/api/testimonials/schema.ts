import { z } from "zod";

export const testimonialInputSchema = z.object({
  customerName: z.string().min(1).max(200),
  quote: z.string().min(1).max(2000),
  // Optional fields accept null so an edit can clear them (undefined = unchanged).
  location: z.string().max(200).nullable().optional(),
  productName: z.string().max(200).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const testimonialUpdateSchema = testimonialInputSchema.partial();
