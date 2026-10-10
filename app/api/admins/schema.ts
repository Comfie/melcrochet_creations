import { z } from "zod";

/** Lowercase so sign-in isn't tripped up by a phone capitalising the first letter. */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(32, "Username must be 32 characters or fewer")
  .regex(/^[a-z0-9._-]+$/, "Use only letters, numbers, dots, dashes or underscores");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(200, "Password is too long");

export const nameSchema = z.string().trim().min(1, "Name is required").max(100);

/** Optional email; "" clears it. */
export const emailSchema = z
  .union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email address")])
  .nullable()
  .optional()
  .transform((v) => (v ? v : v === undefined ? undefined : null));

export const roleSchema = z.enum(["OWNER", "ADMIN"]);

export const adminCreateSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.default("ADMIN"),
});

export const adminUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema,
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
  /** Owner resets someone's password (they'll be signed out everywhere). */
  password: passwordSchema.optional(),
});
