import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetIdentity, useLogout, useNavigation } from "@refinedev/core";
import {
  CircleUser,
  LogOut,
  User as UserIcon,
  LifeBuoy,
  BellRing,
  CalendarClock,
  Languages,
  MoreVertical,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { User, UserRole } from "@/types";
import { ThemeToggle } from "../theme/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { HelpHub } from "@/components/help-hub";
import { CommandMenu } from "@/components/command-menu";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { cn } from "@/lib/utils";
import { subscribeToPush } from "@/lib/push-notifications";
import { useTerm } from "@/contexts/term-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "./user-avatar";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PresenceAvatars } from "@/components/presence-avatars";

export function Header() {
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<User>();
  const { show, edit } = useNavigation();
  const { selectedTerm, setSelectedTerm, terms } = useTerm();
  const { t, i18n } = useTranslation();
  const { isInstallable, isStandalone, handleInstallClick } = usePWAInstall();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success(t("auth.logoutSuccess"));
      },
    });
  };

  const handleEnablePush = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      void subscribeToPush();
      toast.success(t("notifications.pushEnabled"));
    } else {
      toast.error(t("notifications.pushDenied"));
    }
  };

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  };

  const isStudent = identity?.role === UserRole.STUDENT;

  return (
    <header className="flex h-16 md:h-20 items-center gap-3 md:gap-4 border-b border-border/80 dark:border-white/5 bg-background/60 backdrop-blur-xl px-4 md:px-6 sticky top-0 z-50">
      <SidebarTrigger className="md:hidden shrink-0" />
      <div className="flex-1 flex items-center gap-2 md:gap-6 min-w-0">
        <div className="hidden sm:block flex-1 max-w-md">
          <CommandMenu />
        </div>

        {/* Mobile Search Trigger - Optional, can be added if CommandMenu has a mobile version */}

        {/* Term Switcher - Optimized for Mobile */}
        {terms.length > 0 && (
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0 hidden md:block" />
            <Select
              value={selectedTerm?.id?.toString() || ""}
              onValueChange={(val) => {
                const term = terms.find((t) => t.id.toString() === val);
                if (term) setSelectedTerm(term);
              }}
            >
              <SelectTrigger className="w-24 xs:w-32 md:w-45 h-9 bg-muted/30 border-border/80 dark:border-white/10 text-[10px] md:text-sm px-2 md:px-3">
                <SelectValue placeholder={t("classes.form.selectTerm")} />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id.toString()}>
                    {term.name} {term.status === "active" && `(${t("classes.form.status.active")})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isStudent && (
          <div className="hidden lg:flex items-center gap-4 max-w-xs w-full">
            <XPProgressBar xp={identity?.xp || 0} className="w-full" />
          </div>
        )}

        <PresenceAvatars />
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="hidden xs:flex items-center gap-1 md:gap-2 bg-muted/30 p-1 rounded-full border border-border/80 dark:border-white/10">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => changeLanguage("en")}
                className={cn(i18n.language === "en" && "bg-accent", "cursor-pointer")}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeLanguage("ar")}
                className={cn(i18n.language === "ar" && "bg-accent", "cursor-pointer")}
              >
                العربية (Arabic)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationBell />
          <HelpHub />
          <ThemeToggle />
        </div>

        {/* Small Screen Actions Menu */}
        <div className="xs:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-muted/30 border border-border/80 dark:border-white/10"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuItem
                className="gap-3 p-3 rounded-xl transition-all"
                onClick={() => changeLanguage(i18n.language === "en" ? "ar" : "en")}
              >
                <Languages className="h-4 w-4 text-primary" />
                <span className="font-bold">{i18n.language === "en" ? "العربية" : "English"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-around p-3 bg-muted/20 rounded-2xl mt-2">
                <NotificationBell />
                <HelpHub />
                <ThemeToggle />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 md:h-10 md:w-10 rounded-full p-0 hover:bg-primary/10 transition-colors"
            >
              <UserAvatar className="h-9 w-9 md:h-10 md:w-10" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{identity?.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {identity?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            {isStudent && (
              <>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="px-2 py-2">
                  <XPProgressBar xp={identity?.xp || 0} />
                </div>
              </>
            )}

            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => identity?.id && show("users", identity.id)}
            >
              <UserIcon className="h-4 w-4" />
              <span>{t("buttons.viewProfile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => identity?.id && edit("users", identity.id)}
            >
              <CircleUser className="h-4 w-4" />
              <span>{t("buttons.editProfile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleEnablePush}>
              <BellRing className="h-4 w-4" />
              <span>{t("notifications.enablePush")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <LifeBuoy className="h-4 w-4" />
              <span>{t("buttons.contactSupport")}</span>
            </DropdownMenuItem>

            {isInstallable && !isStandalone && (
              <DropdownMenuItem
                className="gap-2 cursor-pointer font-bold text-primary"
                onClick={handleInstallClick}
              >
                <Download className="h-4 w-4" />
                <span>{t("common.installApp", "Install App")}</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("buttons.signOut")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

Header.displayName = "Header";
