import { useMemo } from "react";
import { AcademicTerm, Department, User } from "@/types";

interface DepartmentWithHead extends Department {
  headOfDepartment?: User;
}

/**
 * 📊 useAcademicStats Hook
 * Centralized business logic for calculating academic metrics.
 * Used by TermsList and DepartmentsList to reduce component complexity.
 */
export const useAcademicStats = () => {
  const getTermStats = (terms: AcademicTerm[]) => {
    if (!terms.length) return { total: 0, active: 0, upcoming: 0 };
    return {
      total: terms.length,
      active: terms.filter((term) => term.status === "active").length,
      upcoming: terms.filter((term) => term.status === "upcoming").length,
    };
  };

  const getDepartmentStats = (departments: DepartmentWithHead[]) => {
    if (!departments.length) return { total: 0, withHead: 0, active: 0 };
    return {
      total: departments.length,
      withHead: departments.filter((d) => d.headOfDepartmentId).length,
      active: departments.length, // Currently all fetched departments are considered active
    };
  };

  return {
    getTermStats,
    getDepartmentStats,
  };
};
