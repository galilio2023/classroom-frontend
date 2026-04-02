import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Search,
  MessageSquare,
  User,
  MessageCircle,
  ArrowRight,
  PlusCircle,
  Filter,
  MoreHorizontal,
  Eye,
  Activity,
  Sparkles,
  Clock,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef } from "react";
import { useList, useNavigation, useGetIdentity } from "@refinedev/core";
import { Discussion, User as UserType, UserRole } from "@/types";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import usePageTitle from "@/hooks/use-page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { useTerm } from "@/contexts/term-context";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

const DiscussionsListPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  usePageTitle(t("discussions.title"));
  const { data: identity } = useGetIdentity<UserType>();
  const { selectedTerm } = useTerm();

  const [searchQuery, setSearchQuery] = useState("");
  const { show, create } = useNavigation();

  dayjs.locale(isAr ? "ar" : "en");

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "content",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    f.push({ field: "parentId", operator: "null" as const, value: true });
    if (selectedTerm) {
      f.push({
        field: "termId",
        operator: "eq" as const,
        value: selectedTerm.id,
      });
    }
    return f;
  }, [searchQuery, selectedTerm]);

  const {
    query: { data: discussionsData, isLoading },
  } = useList<Discussion>({
    resource: "discussions",
    pagination: { pageSize: 50, mode: "server" },
    filters,
    sorters: [{ field: "updatedAt", order: "desc" }],
    meta: {
      populate: ["user", "class", "replies"],
    },
  });

  const discussions = discussionsData?.data || [];
  const hasData = discussions.length > 0;

  const stats = useMemo(() => {
    if (!discussions.length) return { total: 0, activeToday: 0, totalReplies: 0 };
    return {
      total: discussions.length,
      activeToday: discussions.filter((d: Discussion) =>
        dayjs(d.updatedAt).isAfter(dayjs().subtract(24, "hour"))
      ).length,
      totalReplies: discussions.reduce(
        (acc: number, curr: Discussion) => acc + (curr.replies?.length || 0),
        0
      ),
    };
  }, [discussions]);

  return (
    <ListView>
      <div className="space-y-8 md:space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-4 flex-1">
            <Breadcrumb />
            <div className="space-y-1 text-start">
              <h1 className="page-title mb-0 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <MessageSquare className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("discussions.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("discussions.description")}
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Button
              onClick={() => create("discussions")}
              size="lg"
              className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
            >
              <PlusCircle className="h-5 w-5" />
              {t("discussions.start")}
            </Button>
          </div>
        </motion.div>

        {/* Stats Row - Adaptive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("discussions.stats.total")}
              </p>
              <p className="text-2xl md:text-3xl font-black">{isLoading ? "..." : stats.total}</p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Activity className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("discussions.stats.active")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-indigo-600">
                {isLoading ? "..." : stats.activeToday}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600">
              <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("discussions.stats.replies")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-green-600">
                {isLoading ? "..." : stats.totalReplies}
              </p>
            </div>
          </Card>
        </div>

        {/* Search & Filters Card - Sticky */}
        <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1 group">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors start-4"
                )}
              />
              <Input
                type="text"
                placeholder={t("discussions.searchPlaceholder")}
                className={cn(
                  "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium ps-11 pe-4"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-2xl border border-border/40 shrink-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("discussions.filter")}
              </span>
            </div>
          </div>
        </Card>

        {/* Discussions List - Global Scroll */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-6 flex flex-col md:flex-row items-center gap-6 border-border/20 bg-background/50"
                >
                  <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                  <div className="flex-1 space-y-4 w-full">
                    <Skeleton className="h-8 w-[350px] max-w-full" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-36 rounded-2xl" />
                </Card>
              ))}
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
              <EmptyState
                icon={Layers}
                title={t("discussions.empty.title")}
                description={t("discussions.empty.desc")}
                className="border-none bg-transparent min-h-0"
                action={{
                  label: t("discussions.start"),
                  onClick: () => create("discussions"),
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {discussions.map((discussion: any, index: number) => {
                  const lastActivity = dayjs(discussion.updatedAt);
                  const discussionColor = (discussion as any).class?.color || "#6366f1";

                  return (
                    <motion.div
                      key={discussion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                      )}
                      onClick={() => show("discussions", discussion.id)}
                    >
                      {/* Class Color Accent */}
                      <div
                        className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-e-full transition-all group-hover:h-20"
                        style={{ backgroundColor: discussionColor }}
                      />

                      {/* Author Avatar */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <Avatar className="h-20 w-20 rounded-[1.5rem] border-4 border-background shadow-lg group-hover:scale-105 transition-transform duration-500">
                          <AvatarImage
                            src={discussion.user.image ?? undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                            {discussion.user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-3 -end-3 p-1.5 rounded-full bg-background shadow-lg shadow-black/10 border-4 border-background">
                          <div
                            className={cn(
                              "p-1 rounded-lg",
                              discussion.user.role === UserRole.TEACHER
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {discussion.user.role === UserRole.TEACHER ? (
                              <Sparkles className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div
                        className={cn("flex-1 min-w-0 w-full text-center md:text-start", "md:ms-8")}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {discussion.content}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge variant="ai" className="h-6">
                              {(discussion as any).class?.name || "General"}
                            </Badge>
                            {discussion.replies && discussion.replies.length > 5 && (
                              <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20 font-black px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] tracking-widest uppercase shadow-sm">
                                {t("discussions.labels.trending")}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <User className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                {discussion.user.role}
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {discussion.user.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <MessageCircle className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                {t("discussions.labels.replies")}
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {discussion.replies?.length || 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Activity
                              </span>
                              <span className="text-[11px] font-black uppercase tracking-tight">
                                {lastActivity.fromNow()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full md:w-auto rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] transition-all border-primary/20 text-primary hover:bg-primary/5"
                        >
                          {t("buttons.view")}
                          <ArrowRight className={cn("h-4 w-4 ms-2 rtl:-scale-x-100")} />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-12 w-12 rounded-2xl md:hidden lg:flex bg-muted/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 p-2 rounded-3xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
                              {t("discussions.labels.options")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => show("discussions", discussion.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Eye className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("discussions.labels.open")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Activity className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("discussions.labels.follow")}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </ListView>
  );
};

export default DiscussionsListPage;
