import { GraduationCap, School } from "lucide-react";

// --- User Roles & Options ---
export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const ROLE_OPTIONS = [
  {
    value: USER_ROLES.STUDENT,
    label: "Student",
    icon: GraduationCap,
  },
  {
    value: USER_ROLES.TEACHER,
    label: "Teacher",
    icon: School,
  },
];

// --- Departments ---
// Note: Ideally, these should be fetched from the API, but keeping them for now
// as they might be used in dropdowns or filters.
export const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Economics",
  "Business Administration",
  "Engineering",
  "Psychology",
  "Sociology",
  "Political Science",
  "Philosophy",
  "Education",
  "Fine Arts",
  "Music",
  "Physical Education",
  "Law",
] as const;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: dept,
  label: dept,
}));

// --- File Upload Constants ---
export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

// --- Mock Data ---
// Keeping these for reference or fallback usage until all pages are fully connected.
export const teachers = [
  {
    id: "1",
    name: "John Doe",
  },
  {
    id: "2",
    name: "Jane Smith",
  },
  {
    id: "3",
    name: "Dr. Alan Turing",
  },
];

export const subjects = [
  {
    id: 1,
    name: "Mathematics",
    code: "MATH",
  },
  {
    id: 2,
    name: "Computer Science",
    code: "CS",
  },
  {
    id: 3,
    name: "Physics",
    code: "PHY",
  },
  {
    id: 4,
    name: "Chemistry",
    code: "CHEM",
  },
];
