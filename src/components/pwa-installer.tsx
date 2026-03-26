import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function PWAInstaller() {
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 start-4 end-4 z-50 md:start-auto md:end-4 md:w-80">
      <div className="bg-card border rounded-lg shadow-lg p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{t("common.pwa.title")}</p>
            <p className="text-xs text-muted-foreground">
              {t("common.pwa.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleInstall}>
            {t("common.pwa.install")}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
