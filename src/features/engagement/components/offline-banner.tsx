import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export function OfflineBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-top-4 relative z-50">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <WifiOff className="h-4 w-4" />
      </div>
      <span>{t("common.offline", "Offline Mode: Learning without Limits")}</span>
    </div>
  );
}
