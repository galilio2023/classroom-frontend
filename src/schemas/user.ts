import * as z from "zod";
import { UserRole, UserStatus } from "@/types";
import { phoneRegex } from "@/lib/validations/regex";

// 1. Define the base object schema
export const baseUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().min(1).email(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  departmentId: z.number().optional().nullable(),
  phoneNumber: z.string().regex(phoneRegex).max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  dateOfBirth: z.string()
    .refine((date) => !date || !isNaN(Date.parse(date)))
    .refine((date) => !date || new Date(date) < new Date())
    .optional()
    .nullable(),
  parentName: z.string().max(255).optional().nullable(),
  parentPhone: z.string().regex(phoneRegex).max(20).optional().nullable(),
});

// 2. Apply refinements to create the form schema
export const userFormSchema = baseUserSchema.superRefine((data, ctx) => {
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 21) {
      if (!data.parentName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parentName"],
          params: { i18n: "auth.register.nameRequired" }
        });
      }
      if (!data.parentPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parentPhone"],
          params: { i18n: "auth.register.phoneRequired" }
        });
      }
    }
  }
});

// 3. Extend the base schema for creation if needed
export const userCreateSchema = userFormSchema;
