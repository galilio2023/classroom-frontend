import * as z from "zod";

export const departmentFormSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(255).optional().nullable(),
  headId: z.string().optional().nullable(),
});
