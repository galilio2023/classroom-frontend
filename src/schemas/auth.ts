import * as z from "zod";

/**
 * Enhanced Sign Up Form Schema with automatic i18n validation.
 * Errors are handled globally via zod-i18n-map in i18n.ts
 */
export const signUpFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher", "parent"]),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  verificationDocumentUrl: z.string().optional(),
  verificationDocumentCldPubId: z.string().optional(),
});
