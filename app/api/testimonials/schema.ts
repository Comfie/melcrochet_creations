import { z } from "zod";

export const testimonialInputSchema = z.object({
  customerName: z.string().min(1).max(200),
  quote: z.string().min(1).max(2000),
  location: z.string().max(200).optional(),
  productName: z.string().max(200).optional(),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const testimonialUpdateSchema = testimonialInputSchema.partial();
