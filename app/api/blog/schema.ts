import { z } from "zod";

export const blogPostInputSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  coverImagePublicId: z.string().optional(),
  youtubeUrl: z.string().url().optional(),
  published: z.boolean().optional(),
});

export const blogPostUpdateSchema = blogPostInputSchema.partial();
