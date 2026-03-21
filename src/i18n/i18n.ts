import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// Cache buster: 1774056200000
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";

// 1. Import the built-in Zod translations!
import zodEn from "zod-i18n-map/locales/en/zod.json";
import zodAr from "zod-i18n-map/locales/ar/zod.json";

import en from "./en.json";
import ar from "./ar.json";

export const defaultNS = "translation";

// 2. Add the "zod" namespace to your resources
export const resources = {
  en: {
    translation: en,
    zod: zodEn, 
  },
  ar: {
    translation: ar,
    zod: zodAr, 
  },
} as const;

const STORAGE_KEY = "i18nextLng";
const savedLng = localStorage.getItem(STORAGE_KEY);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLng || "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    debug: true,
    defaultNS,
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng); 
});

// 3. THE MAGIC TRICK: Tell Zod to route all errors through i18next
z.setErrorMap(zodI18nMap);

export default i18n;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources["en"];
  }
}
