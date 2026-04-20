import * as z from "zod";
import { egyptNumericSchema, validateEgyptianID } from "@/lib/validators";
import { TFunction } from "i18next";

/**
 * 🛡️ REGISTRATION SCHEMA
 * Modularized validation for the multi-step registration flow.
 * Includes Egyptian-specific normalization and Law 151 compliance.
 */
export const getRegisterSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(3, t("auth.register.nameMin", "Name must be at least 3 characters")),
    email: z.string().email(t("auth.register.emailInvalid", "Invalid email address")),
    password: z
      .string()
      .min(8, t("auth.register.passwordMin", "Password must be at least 8 characters")),
    role: z.enum(["student", "teacher", "parent"]),
    phoneNumber: egyptNumericSchema.pipe(
      z.string().min(10, t("auth.register.phoneRequired", "Phone number is required"))
    ),
    nationalId: egyptNumericSchema.pipe(
      z.string().length(14, t("auth.register.nationalIdLength", "National ID must be 14 digits"))
    ),
    bio: z.string().optional(),
    dateOfBirth: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: egyptNumericSchema.optional().or(z.string().length(0)).or(z.null()),
    childInviteCode: z.string().optional(),
    verificationDocumentUrl: z.string().optional(),
    verificationDocumentCldPubId: z.string().optional(),
    hasAiConsent: z.boolean().refine((val) => val === true, {
      message: t("auth.register.consentRequired", "AI Consent is required"),
    }),
  });

export type RegisterFormValues = z.infer<ReturnType<typeof getRegisterSchema>>;
