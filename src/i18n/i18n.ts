import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ar from "./ar.json";

// 1. Define the resources for type checking
export const defaultNS = "translation";
export const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
} as const;

// Manual persistence helper
const STORAGE_KEY = "i18nextLng";
const savedLng = localStorage.getItem(STORAGE_KEY);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLng || "en", // Use saved language or default to English
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    debug: true,
    defaultNS,
  });

// Handle RTL (Right-to-Left) direction for Arabic and persist language
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng); // Persist language choice
});

export default i18n;

// 2. Add this declaration at the bottom of i18n.ts
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources["en"];
  }
}
