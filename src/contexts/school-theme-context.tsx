import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { useCapabilities } from "@/hooks/use-capabilities";

interface SchoolTheme {
  primaryColor: string;
  logoUrl: string | null;
  schoolName: string | null;
}

const SchoolThemeContext = createContext<SchoolTheme | undefined>(undefined);

const SUITE_COLORS = {
  private: "#6366f1", // Indigo
  school: "#3b82f6", // Blue
  faculty: "#8b5cf6", // Purple
  corporate: "#10b981", // Emerald
};

export const SchoolThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: identity } = useGetIdentity<User>();
  const { suiteType } = useCapabilities();

  const theme = useMemo(() => {
    const config = (identity as any)?.school?.brandingConfig || {};
    const fallbackColor =
      SUITE_COLORS[suiteType as keyof typeof SUITE_COLORS] || SUITE_COLORS.private;

    return {
      primaryColor: config.primaryColor || fallbackColor,
      logoUrl: config.logoUrl || null,
      schoolName: identity?.schoolName || null,
    };
  }, [identity, suiteType]);

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
