import * as z from "zod";

/**
 * Enhanced Sign Up Form Schema
 * This schema matches all the fields collected in the RegisterPage.
 * It ensures that the authProvider passes all data to the backend.
 */
export const signUpFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "teacher", "parent"]),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  verificationDocumentUrl: z.string().optional(),
  verificationDocumentCldPubId: z.string().optional(),
});
