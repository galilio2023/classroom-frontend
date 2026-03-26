import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface UnauthorizedPageProps {
  reason?: string;
}

const UnauthorizedPage = ({ reason }: UnauthorizedPageProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-[-10%] start-[-10%] w-[40%] h-[40%] bg-destructive/5 blur-[120px] rounded-full" />

      <div className="z-10 space-y-6 max-w-lg">
        <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-destructive/20 animate-pulse">
          <ShieldAlert className="w-12 h-12 text-destructive" />
        </div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-linear-to-br from-destructive to-orange-500 tracking-tighter">
          403
        </h1>

        <h2 className="text-3xl font-black uppercase tracking-tight">
          {t("library.accessDenied")}
        </h2>

        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
          {reason ||
            t(
              "library.accessDeniedDesc",
              "Sorry, you do not have permission to access this page.",
            )}
        </p>

        <div className="pt-8">
          <Button
            asChild
            size="lg"
            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform group"
          >
            <Link to="/">
              {isAr ? (
                <ArrowLeft className="ms-2 h-5 w-5 rotate-180" />
              ) : (
                <ArrowLeft className="me-2 h-5 w-5" />
              )}
              {t("buttons.goBack")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
