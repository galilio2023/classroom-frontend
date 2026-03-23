import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// Cache buster: 1774225500000
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";

// 1. Import the built-in Zod translations!
import zodEn from "zod-i18n-map/locales/en/zod.json";
import zodAr from "zod-i18n-map/locales/ar/zod.json";

import enAuth from "./locales/en/auth.json";
import enClasses from "./locales/en/classes.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enLanding from "./locales/en/landing.json";

import arAuth from "./locales/ar/auth.json";
import arClasses from "./locales/ar/classes.json";
import arCommon from "./locales/ar/common.json";
import arDashboard from "./locales/ar/dashboard.json";
import arLanding from "./locales/ar/landing.json";

export const defaultNS = "translation";

// 2. Add the "zod" namespace to your resources
export const resources = {
  en: {
    translation: {
      ...enAuth,
      ...enClasses,
      ...enCommon,
      ...enDashboard,
      ...enLanding,
    },
    zod: zodEn, 
  },
  ar: {
    translation: {
      ...arAuth,
      ...arClasses,
      ...arCommon,
      ...arDashboard,
      ...arLanding,
    },
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
    returnObjects: true,
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
