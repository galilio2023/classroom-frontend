import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useGetIdentity } from "@refinedev/core";
import { User, SuiteType } from "@/types";
import { useCapabilities } from "@/hooks/use-capabilities";
import { SUITE_COLORS } from "@/constants/theme";
import { normalizeHex, withAlpha } from "@/lib/colors";

interface SchoolTheme {
  primaryColor: string;
  logoUrl: string | null;
  schoolName: string | null;
}

const SchoolThemeContext = createContext<SchoolTheme | undefined>(undefined);

export const SchoolThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: identity } = useGetIdentity<User>();
  const { suiteType } = useCapabilities();

  const theme = useMemo((): SchoolTheme => {
    const branding = identity?.school?.brandingConfig;
    const fallbackColor = SUITE_COLORS[suiteType as SuiteType] || SUITE_COLORS.private;

    return {
      primaryColor: branding?.primaryColor || fallbackColor,
      logoUrl: branding?.logoUrl || null,
      schoolName: identity?.schoolName || null,
    };
  }, [identity, suiteType]);

  useEffect(() => {
    // 🛡️ SECURITY: Normalize hex color before injecting into CSS variables (Review #15)
    const normalizedColor = normalizeHex(theme.primaryColor) || "#6366f1"; // Fallback to Indigo

    document.documentElement.style.setProperty("--primary", normalizedColor);

    // 🚀 RULE: Generate a subtle glow/muted version for glassmorphism
    const alphaHex = withAlpha(normalizedColor, "22");
    if (alphaHex) {
      document.documentElement.style.setProperty("--primary-muted", alphaHex);
    } else {
      // Fallback if withAlpha failed for some reason
      document.documentElement.style.setProperty("--primary-muted", `${normalizedColor}22`);
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
