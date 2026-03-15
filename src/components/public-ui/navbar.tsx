import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Menu,
  X,
  Sparkles,
  Layers,
  Zap,
  BookOpen,
  Languages,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "../refine-ui/theme/theme-toggle";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const { data: identity } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    {
      name: t("landing.nav.features"),
      href: "/#features",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      name: t("landing.nav.aiHub"),
      href: "/#ai",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      name: t("landing.nav.pricing"),
      href: "/pricing",
      icon: <Crown className="h-4 w-4" />,
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-primary/10 py-3 shadow-sm"
          : "bg-transparent py-6",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group relative">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="relative"
          >
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
          </motion.div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">
            Class<span className="text-primary not-italic">Room</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 bg-muted/20 p-1.5 rounded-2xl border border-primary/5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl flex items-center gap-2",
                isActive(link.href)
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "hover:bg-primary/5 text-muted-foreground hover:text-primary",
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-primary/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg gap-2 font-bold uppercase tracking-widest text-[10px] h-8"
                >
                  <Languages className="h-4 w-4" />
                  {i18n.language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 p-2 rounded-2xl border-primary/10 backdrop-blur-xl bg-background/90"
              >
                <DropdownMenuItem
                  onClick={() => changeLanguage("en")}
                  className={cn(
                    "font-black uppercase tracking-widest text-[10px] py-3 cursor-pointer rounded-xl",
                    i18n.language === "en" && "bg-primary/10 text-primary",
                  )}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage("ar")}
                  className={cn(
                    "font-black uppercase tracking-widest text-[10px] py-3 cursor-pointer rounded-xl",
                    i18n.language === "ar" && "bg-primary/10 text-primary",
                  )}
                >
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
          </div>

          <div className="h-6 w-px bg-primary/10 mx-2" />

          {!identity ? (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="font-black uppercase tracking-widest text-[10px] hover:bg-primary/5"
                >
                  {t("buttons.signIn")}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="font-black uppercase tracking-widest text-[10px] rounded-xl px-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                  {t("buttons.getStarted")}
                  <Zap className="ml-2 h-3 w-3 fill-current" />
                </Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-xl p-0 hover:bg-primary/10 transition-colors border border-primary/5"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={identity?.image || ""}
                      alt={identity?.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                      {identity?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-2xl border-primary/10 backdrop-blur-xl bg-background/90"
              >
                <div className="px-3 py-3 border-b border-primary/5 mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                    {identity?.role}
                  </p>
                  <p className="text-sm font-bold truncate">{identity?.name}</p>
                </div>
                <Link to="/dashboard">
                  <DropdownMenuItem className="font-black uppercase tracking-widest text-[10px] py-3 cursor-pointer rounded-xl gap-3">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    {t("common.dashboard")}
                  </DropdownMenuItem>
                </Link>
                <Link to={`/users/show/${identity?.id}`}>
                  <DropdownMenuItem className="font-black uppercase tracking-widest text-[10px] py-3 cursor-pointer rounded-xl gap-3">
                    <UserIcon className="h-4 w-4 text-primary" />
                    {t("common.myProfile")}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-primary/5 my-2" />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="font-black uppercase tracking-widest text-[10px] py-3 cursor-pointer rounded-xl gap-3 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {t("buttons.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            className={cn(
              "p-2.5 rounded-xl transition-all",
              isMobileMenuOpen
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50",
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-background border-l border-primary/10 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-primary/5">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-xl">
                    <BookOpen className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-black uppercase italic tracking-tighter">
                    Class<span className="text-primary not-italic">Room</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-muted/50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
                    Navigation
                  </p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-black uppercase tracking-widest flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 transition-colors"
                    >
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        {link.icon}
                      </div>
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-primary/10 w-full" />

                <div className="flex flex-col gap-4">
                  {identity && (
                    <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-primary/5 rounded-2xl">
                      <Avatar className="h-12 w-12 rounded-xl border-2 border-primary/20">
                        <AvatarImage src={identity?.image || ""} />
                        <AvatarFallback>
                          {identity?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black uppercase tracking-widest text-primary">
                          {identity?.role}
                        </p>
                        <p className="font-bold truncate">{identity?.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                        Settings
                      </span>
                      <div className="flex gap-2">
                        <ThemeToggle />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                        Language
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            i18n.language === "en" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => changeLanguage("en")}
                          className="text-[10px] font-black uppercase tracking-widest rounded-lg h-8"
                        >
                          EN
                        </Button>
                        <Button
                          variant={
                            i18n.language === "ar" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => changeLanguage("ar")}
                          className="text-[10px] font-black uppercase tracking-widest rounded-lg h-8"
                        >
                          AR
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-primary/5 bg-muted/20">
                {!identity ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full font-black uppercase tracking-widest h-14 rounded-2xl border-2"
                      >
                        {t("buttons.signIn")}
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg shadow-primary/20">
                        {t("buttons.getStarted")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg shadow-primary/20 gap-3">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full font-black uppercase tracking-widest h-14 rounded-2xl border-2 gap-3 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      {t("buttons.signOut")}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
