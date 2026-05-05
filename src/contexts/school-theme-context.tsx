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

  // 🛡️ SECURITY: Pre-calculate fallback color for both useMemo and useEffect (Review #15)
  const suiteFallback = useMemo(
    () => SUITE_COLORS[suiteType as SuiteType] || SUITE_COLORS.private,
    [suiteType]
  );

  const primaryColor = identity?.school?.brandingConfig?.primaryColor;
  const logoUrl = identity?.school?.brandingConfig?.logoUrl;
  const schoolName = identity?.schoolName;

  const theme = useMemo((): SchoolTheme => {
    return {
      primaryColor: primaryColor || suiteFallback,
      logoUrl: logoUrl || null,
      schoolName: schoolName || null,
    };
  }, [primaryColor, logoUrl, schoolName, suiteFallback]);

  useEffect(() => {
    // 🛡️ SECURITY: Normalize hex color before injecting into CSS variables (Review #15)
    const normalizedColor = normalizeHex(theme.primaryColor) || suiteFallback;

    document.documentElement.style.setProperty("--primary", normalizedColor);

    // 🚀 RULE: Generate a subtle glow/muted version for glassmorphism
    const alphaHex = withAlpha(normalizedColor, "22");

    // 🛡️ HARDENING: Ensure we only set the muted variable if we have a valid 8-digit hex (+ hash)
    if (alphaHex && alphaHex.length === 9) {
      document.documentElement.style.setProperty("--primary-muted", alphaHex);
    } else {
      // Fallback: Use the original color without alpha to avoid invalid CSS
      document.documentElement.style.setProperty("--primary-muted", normalizedColor);
    }

    // ♿ ACCESSIBILITY: Apply High Contrast Mode
    if (identity?.accessibilityPreferences?.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // ♿ ACCESSIBILITY: Apply Font Scaling
    const scale = identity?.accessibilityPreferences?.fontSize || 100;
    document.documentElement.style.fontSize = `${(scale / 100) * 16}px`;

    // 📡 REACH: Low Bandwidth Mode Signal (for components to query)
    if (identity?.lowBandwidthMode) {
      document.documentElement.setAttribute("data-low-bandwidth", "true");
    } else {
      document.documentElement.removeAttribute("data-low-bandwidth");
    }
  }, [
    theme.primaryColor,
    suiteFallback,
    identity?.accessibilityPreferences,
    identity?.lowBandwidthMode,
  ]);

  return <SchoolThemeContext.Provider value={theme}>{children}</SchoolThemeContext.Provider>;
};

export const useSchoolTheme = () => {
  const context = useContext(SchoolThemeContext);
  if (context === undefined) {
    throw new Error("useSchoolTheme must be used within a SchoolThemeProvider");
  }
  return context;
};
