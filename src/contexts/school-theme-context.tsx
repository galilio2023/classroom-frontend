import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useGetIdentity } from "@refinedev/core";
import { User, SuiteType } from "@/types";
import { useCapabilities } from "@/hooks/use-capabilities";
import { SUITE_COLORS } from "@/constants/theme";

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
    if (theme.primaryColor && typeof theme.primaryColor === "string") {
      // 🛡️ SECURITY: Normalize hex color to 6 digits before adding alpha (Review #15)
      let hex = theme.primaryColor.trim();

      // If it's a hex color, try to normalize it
      if (hex.startsWith("#")) {
        hex = hex.slice(1);
        if (hex.length === 3) {
          hex = hex
            .split("")
            .map((c) => c + c)
            .join("");
        }
      }

      // 🛡️ VALIDATION: Only append alpha if it's a valid 6-digit hex string (Review #15)
      const isValidHex = /^[0-9A-Fa-f]{6}$/i.test(hex);
      // 🚀 FALLBACK: Use a safe indigo constant if the institutional color is malformed
      const normalizedColor = isValidHex ? `#${hex}` : "#6366f1";

      document.documentElement.style.setProperty("--primary", normalizedColor);

      // 🚀 RULE: Generate a subtle glow/muted version for glassmorphism
      // If not a hex color (e.g. rgb/hsl), we just use it as is for the muted version
      // or rely on CSS opacity where possible.
      const alphaHex = isValidHex ? `${normalizedColor}22` : normalizedColor;
      document.documentElement.style.setProperty("--primary-muted", alphaHex);
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
