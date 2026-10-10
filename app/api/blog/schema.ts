import { z } from "zod";

export const blogPostInputSchema = z.object({
  title: z.string().min(1).max(200),
  // Optional fields accept null so an edit can clear them (undefined = unchanged).
  excerpt: z.string().max(500).nullable().optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().nullable().optional(),
  coverImagePublicId: z.string().nullable().optional(),
  youtubeUrl: z.string().url().nullable().optional(),
  published: z.boolean().optional(),
});

export const blogPostUpdateSchema = blogPostInputSchema.partial();
