import * as z from "zod";
import { UserRole } from "@/types";

export const userFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Role is required" }),
  }),
});

// For creation, we might need a password (optional for now if we assume email invite flow, but let's add it)
export const userCreateSchema = userFormSchema.extend({
  // password: z.string().min(6, "Password must be at least 6 characters"), 
  // We will skip password for now and assume the backend handles it or we add it later
});
