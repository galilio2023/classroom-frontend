import * as z from "zod";
import { UserRole, UserStatus } from "@/types";

const phoneRegex = /^\+?[\d\s-()]{7,20}$/;

// 1. Define the base object schema
export const baseUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Role is required" }),
  }),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  departmentId: z.number().optional().nullable(),
  phoneNumber: z.string().regex(phoneRegex, "Invalid phone number format").max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  dateOfBirth: z.string()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format")
    .refine((date) => !date || new Date(date) < new Date(), "Date of birth must be in the past")
    .optional()
    .nullable(),
  parentName: z.string().max(255).optional().nullable(),
  parentPhone: z.string().regex(phoneRegex, "Invalid parent phone number format").max(20).optional().nullable(),
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
          message: "Parent name is required for users under 21",
          path: ["parentName"],
        });
      }
      if (!data.parentPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Parent phone is required for users under 21",
          path: ["parentPhone"],
        });
      }
    }
  }
});

// 3. Extend the base schema for creation if needed (or just use the refined one)
export const userCreateSchema = userFormSchema;
