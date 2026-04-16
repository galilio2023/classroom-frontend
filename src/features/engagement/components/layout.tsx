import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { OfflineBanner } from "@/features/engagement/components/offline-banner";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

/**
 * PublicLayout
 * Optimized for smooth transitions between landing, pricing, and auth pages.
 */
export const PublicLayout = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isAr = i18n.language === "ar";

  // Syncing document direction and language for global styles and SEO
  useEffect(() => {
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isAr]);

  return (
    <div
      className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary transition-colors duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 pt-16 overflow-x-hidden relative">
        {/* Syncing animation pattern with internal Layout for consistency */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};
