import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ar from "./ar.json";

// Manual persistence helper
const STORAGE_KEY = "i18nextLng";
const savedLng = localStorage.getItem(STORAGE_KEY);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
    },
    lng: savedLng || "en", // Use saved language or default to English
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

// Initial set
const currentLng = i18n.language;
if (currentLng === 'ar') {
  document.documentElement.setAttribute('dir', 'rtl');
  document.documentElement.setAttribute('lang', 'ar');
} else {
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', 'en');
}

// Handle RTL (Right-to-Left) direction for Arabic and persist language
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng); // Persist language choice

  if (lng === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');
  }
});

export default i18n;
