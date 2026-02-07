import * as z from "zod";
import { ClassStatus } from "@/types";

export const scheduleSchema = z.object({
  day: z.string().min(1, "Day is required"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

// This is the base schema including all fields
export const classFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().optional(),
  subjectId: z.coerce.number().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").default(50),
  status: z.nativeEnum(ClassStatus).default(ClassStatus.ACTIVE),
  schedules: z.array(scheduleSchema).default([]),
});

// This is the schema for the creation form, which does not include teacherId
export const classCreateFormSchema = classFormSchema.omit({ teacherId: true });
