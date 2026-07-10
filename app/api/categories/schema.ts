import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(100),
  blurb: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
});
