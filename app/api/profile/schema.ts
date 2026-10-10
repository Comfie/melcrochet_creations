import { z } from "zod";
import { emailSchema, nameSchema, passwordSchema, usernameSchema } from "../admins/schema";

export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  username: usernameSchema.optional(),
  email: emailSchema,
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: passwordSchema,
});
