import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  // null clears it on edit (undefined = unchanged).
  blurb: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

/** Category ids in their new display order. */
export const categoryOrderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
});
