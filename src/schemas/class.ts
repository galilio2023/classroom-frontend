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
  subjectId: z.coerce.number().min(1),
  termId: z.coerce.number().min(1),
  teacherId: z.string().min(1),
  capacity: z.coerce.number().min(1),
  status: z.nativeEnum(ClassStatus),
  schedules: z.array(scheduleSchema),
  color: z.string().regex(hexColorRegex).optional().default("#3b82f6"), // Default to a blue color
});

// This is the schema for the creation form.
// teacherId is made optional as it's not part of the form fields but added programmatically.
export const classCreateFormSchema = classFormSchema.partial({ teacherId: true });
