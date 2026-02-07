import * as z from "zod";

export const departmentFormSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be less than 50 characters"),
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().max(255, "Description must be less than 255 characters").optional(),
});
