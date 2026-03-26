import { BaseRecord } from "@refinedev/core";

export interface Subject extends BaseRecord {
  id: string;
  code: string;
  name: string;
  department: string;
  description: string;
}

export const mockSubjects: Subject[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "CS", // Shortened for Badge
    description:
      "A foundational course covering the basics of programming and computational thinking.",
  },
  {
    id: "2",
    code: "ARC205",
    name: "Architectural Design Studio I",
    department: "ARCH", // Standard Code
    description: "Exploration of spatial design principles and drafting techniques.",
  },
  {
    id: "3",
    code: "MGT310",
    name: "Organizational Behavior",
    department: "BIZ", // Standard Code
    description: "A study of human behavior within organizations and team dynamics.",
  },
];
