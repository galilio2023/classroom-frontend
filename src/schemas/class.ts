import * as z from "zod";
import { ClassStatus } from "@/types";
import { time24hRegex, hexColorRegex } from "@/lib/validations/regex";

export const scheduleSchema = z.object({
  day: z.string().min(1),
  startTime: z.string().regex(time24hRegex),
  endTime: z.string().regex(time24hRegex),
});

// This is the base schema including all fields
export const classFormSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  subjectId: z.coerce.number().min(1).optional(), // Made optional
  termId: z.coerce.number().min(1),
  teacherId: z.string().min(1),
  capacity: z.coerce.number().min(1),
  status: z.nativeEnum(ClassStatus),
  schedules: z.array(scheduleSchema),
  color: z.string().regex(hexColorRegex).optional().default("#3b82f6"), // Default to a blue color
  isPaid: z.boolean().default(false),
  priceAmount: z.coerce.number().min(0).default(0),
  currency: z.string().min(3).max(3).default("USD"),
  version: z.number().optional(),
});

// This is the schema for the creation form.
// teacherId is made optional as it's not part of the form fields but added programmatically.
export const classCreateFormSchema = classFormSchema
  .partial({ teacherId: true })
  .extend({
    newSubjectName: z.string().min(1, "New subject name cannot be empty").optional(), // New field for creating a subject
  })
  .refine(
    (data) => {
      // Ensure either subjectId is provided OR newSubjectName is provided, but not both.
      // And if newSubjectName is provided, subjectId must be undefined.
      const hasSubjectId =
        data.subjectId !== undefined && data.subjectId !== null && data.subjectId !== 0;
      const hasNewSubjectName =
        data.newSubjectName !== undefined && data.newSubjectName.trim() !== "";

      if (hasSubjectId && hasNewSubjectName) {
        return false; // Cannot have both
      }
      if (!hasSubjectId && !hasNewSubjectName) {
        return false; // Must have at least one
      }
      return true;
    },
    {
      message: "Please select an existing subject or enter a new subject name.",
      path: ["subjectId"], // Attach error to subjectId field
    }
  );
