import * as z from "zod";
import i18next from "i18next";

/**
 * Enhanced Sign Up Form Schema with i18n validation messages.
 * Note: We use { massage: i18next.t(...) } object instead of a naked function
 * to satisfy Zod's type expectations.
 */
export const signUpFormSchema = z.object({
  name: z.string().min(1, { message: i18next.t("auth.register.nameRequired") }),
  email: z.string().email({ message: i18next.t("auth.register.invalidEmail") }),
  password: z
    .string()
    .min(8, { message: i18next.t("auth.register.passwordMinLength") }),
  role: z.enum(["student", "teacher", "parent"]),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  verificationDocumentUrl: z.string().optional(),
  verificationDocumentCldPubId: z.string().optional(),
});
