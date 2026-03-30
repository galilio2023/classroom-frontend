import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function PWAInstaller() {
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if the app is already running in standalone mode (installed)
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes("android-app://");
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // If it's iOS and not installed, we can show instructions
    if (isIOSDevice && !isStandaloneMode) {
      // Check if we've already shown it or if user dismissed it recently
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    }

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      toast.success(t("common.pwa.success"));
    }

    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 7 days
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-4 start-4 end-4 z-50 md:start-auto md:end-4 md:w-96">
      <div className="bg-card border rounded-lg shadow-lg p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{t("common.pwa.title")}</p>
              <p className="text-xs text-muted-foreground">{t("common.pwa.description")}</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isIOS ? (
          <div className="bg-muted/50 rounded-md p-3 text-xs flex items-start gap-3">
            <Share className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <p className="leading-relaxed">
              {t("common.pwa.ios.instruction")}
            </p>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button size="sm" onClick={handleInstall} className="w-full md:w-auto">
              {t("common.pwa.install")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
