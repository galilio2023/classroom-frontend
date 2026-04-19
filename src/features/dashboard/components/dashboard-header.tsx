import {} from "framer-motion";
import { Clock, Bell, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WelcomeHeader } from "./welcome-header";
import { useTranslation } from "react-i18next";
import { User } from "@/types";
import { DashboardData } from "@/types/dashboard";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface Props {
  identity?: User;
  isStudent: boolean;
  analyticsData: DashboardData;
}

export const DashboardHeader = ({ identity, isStudent, analyticsData }: Props) => {
  const { i18n, t } = useTranslation();
  const { isOnline } = useOfflineSync();

  return (
    <div className="relative group">
      <WelcomeHeader
        name={identity?.name || "User"}
        isStudent={isStudent}
        user={identity}
        data={analyticsData}
      />
      <div className="absolute top-0 end-0 hidden lg:flex items-center gap-4">
        {!isOnline && (
          <Badge
            variant="destructive"
            className="rounded-full px-5 py-2 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse"
          >
            <WifiOff className="h-3.5 w-3.5 me-2" />
            {t("offline.mode")}
          </Badge>
        )}
        <Badge className="rounded-full px-5 py-2 font-black text-[10px] uppercase tracking-[0.2em] bg-background/60 backdrop-blur-3xl border-border/40 text-muted-foreground shadow-sm group-hover:shadow-md transition-all duration-300">
          <Clock className="h-3.5 w-3.5 me-2 text-primary" />
          {new Date().toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </Badge>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background/60 backdrop-blur-3xl border-border/40 shadow-sm h-11 w-11 hover:scale-110 active:scale-95 transition-all"
        >
          <Bell className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
};
