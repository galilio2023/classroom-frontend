/**
 * 🛡️ GENERATED FILE - DO NOT EDIT MANUALLY
 * This file is synchronized with the backend schemas.
 * Last Sync: 2026-03-28
 */

export const resourceFilterMappings: Record<string, Record<string, string>> = {
  subjects: {
    department: "departmentId",
    headOfSubject: "headOfSubjectId",
  },
  classes: {
    subject: "subjectId",
    teacher: "teacherId",
    term: "termId",
    department: "departmentId",
  },
  enrollments: {
    class: "classId",
    student: "studentId",
    approvedBy: "approvedById",
  },
  assignments: {
    class: "classId",
    module: "moduleId",
  },
  submissions: {
    assignment: "assignmentId",
    student: "studentId",
    gradedBy: "gradedById",
  },
  discussions: {
    class: "classId",
    parent: "parentId",
    user: "userId",
  },
  attendance: {
    class: "classId",
    student: "studentId",
    session: "sessionId",
  },
  resources: {
    class: "classId",
    module: "moduleId",
  },
  "profile-requests": {
    user: "userId",
  },
  quizzes: {
    class: "classId",
    module: "moduleId",
  },
  modules: {
    class: "classId",
    department: "departmentId",
  },
  progress: {
    class: "classId",
    user: "userId",
  },
  "users/children": {
    parent: "parentId",
  },
  "teacher-applications": {
    teacher: "teacherId",
    class: "classId",
  },
};
