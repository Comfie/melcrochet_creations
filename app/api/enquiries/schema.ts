import { z } from "zod";

export const enquiryInputSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  message: z.string().min(1).max(5000),
  // Honeypot: a real visitor never sees or fills this field. Any non-empty
  // value means a bot filled the form; reject as a validation failure so
  // it never reaches the database or Melissa's inbox.
  website: z.string().max(0).optional(),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["NEW", "READ", "ARCHIVED"]),
});
