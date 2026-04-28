import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useGetIdentity } from "@refinedev/core";
import { User, BrandingConfig } from "@/types";
import { useCapabilities } from "@/hooks/use-capabilities";

interface SchoolTheme {
  primaryColor: string;
  logoUrl: string | null;
  schoolName: string | null;
}

const SchoolThemeContext = createContext<SchoolTheme | undefined>(undefined);

/**
 * 🎨 SUITE BRANDING DEFAULTS
 * Mandate Review #14: Ensure these align with CSS variables for suite-specific UI.
 */
const SUITE_COLORS: Record<string, string> = {
  private: "#6366f1", // Indigo-500
  school: "#3b82f6", // Blue-500
  faculty: "#8b5cf6", // Purple-500
  corporate: "#10b981", // Emerald-500
};

export const SchoolThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: identity } = useGetIdentity<User>();
  const { suiteType } = useCapabilities();

  const theme = useMemo((): SchoolTheme => {
    const branding = identity?.school?.brandingConfig;
    const fallbackColor = SUITE_COLORS[suiteType as string] || SUITE_COLORS.private;

    return {
      primaryColor: branding?.primaryColor || fallbackColor,
      logoUrl: branding?.logoUrl || null,
      schoolName: identity?.schoolName || null,
    };
  }, [identity, suiteType]);

  useEffect(() => {
    if (theme.primaryColor) {
      document.documentElement.style.setProperty("--primary", theme.primaryColor);
      // 🚀 RULE: Generate a subtle glow/muted version for glassmorphism without transparency issues
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
