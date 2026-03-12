import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { OfflineBanner } from "@/components/offline-banner";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export const PublicLayout = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  // Senior Tip: Sync HTML dir attribute with i18n language
  useEffect(() => {
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [isAr, i18n.language]);

  return (
    <div 
      className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary transition-colors duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 pt-16 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
