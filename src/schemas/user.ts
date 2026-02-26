import * as z from "zod";
import { UserRole } from "@/types";

export const userFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Role is required" }),
  }),
  phoneNumber: z.string().max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
});

export const userCreateSchema = userFormSchema.extend({});
