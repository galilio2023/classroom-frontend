import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";

interface SchoolTheme {
  primaryColor: string;
  logoUrl: string | null;
  schoolName: string | null;
}

const SchoolThemeContext = createContext<SchoolTheme | undefined>(undefined);

export const SchoolThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: identity } = useGetIdentity<User>();

  const theme = useMemo(() => {
    const config = (identity as any)?.school?.brandingConfig || {};
    return {
      primaryColor: config.primaryColor || "#4f46e5", // Default Tablawy Indigo
      logoUrl: config.logoUrl || null,
      schoolName: identity?.schoolName || null,
    };
  }, [identity]);

  useEffect(() => {
    if (theme.primaryColor) {
      document.documentElement.style.setProperty("--primary", theme.primaryColor);
      // Generate a subtle glow/muted version for glassmorphism
      document.documentElement.style.setProperty("--primary-muted", `${theme.primaryColor}22`);
    }
  }, [theme.primaryColor]);

  return <SchoolThemeContext.Provider value={theme}>{children}</SchoolThemeContext.Provider>;
};

export const useSchoolTheme = () => {
  const context = useContext(SchoolThemeContext);
  if (context === undefined) {
    throw new Error("useSchoolTheme must be used within a SchoolThemeProvider");
  }
  return context;
};
