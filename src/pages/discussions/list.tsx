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
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
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
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
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

dayjs.extend(relativeTime);

const DiscussionsListPage = () => {
  usePageTitle("Community Discussions");
  const { data: identity } = useGetIdentity<UserType>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const { selectedTerm } = useTerm();

  const [searchQuery, setSearchQuery] = useState("");
  const { show, create } = useNavigation();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "content", operator: "contains" as const, value: searchQuery });
    }
    // Only show top-level discussions (not replies)
    f.push({ field: "parentId", operator: "null" as const, value: true });
    if (selectedTerm) {
        f.push({ field: "termId", operator: "eq" as const, value: selectedTerm.id });
    }
    return f;
  }, [searchQuery, selectedTerm]);

  const { query: { data: discussionsData, isLoading } } = useList<Discussion>({
    resource: "discussions",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "updatedAt", order: "desc" }],
    meta: {
      populate: ["user", "class", "replies"]
    }
  });

  const discussions = discussionsData?.data || [];
  const hasData = discussions.length > 0;

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 120, []);

  const rowVirtualizer = useVirtualizer({
    count: discussions.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!discussions.length) return { total: 0, activeToday: 0, totalReplies: 0 };
    return {
      total: discussions.length,
      activeToday: discussions.filter((d: Discussion) => dayjs(d.updatedAt).isAfter(dayjs().subtract(24, 'hour'))).length,
      totalReplies: discussions.reduce((acc: number, curr: Discussion) => acc + (curr.replies?.length || 0), 0)
    };
  }, [discussions]);

  return (
    <div className="space-y-10 pb-20">
      <ListView>
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight">Community Hub</h1>
                <p className="text-muted-foreground font-medium mt-1">Engage with students and teachers in class-wide discussion threads.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                  onClick={() => create("discussions")}
                  className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="h-5 w-5" />
                  Start Discussion
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Threads</p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-indigo-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-indigo-500/5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Today</p>
                <p className="text-2xl font-black text-indigo-600">{isLoading ? "..." : stats.activeToday}</p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Replies</p>
                <p className="text-2xl font-black text-green-600">{isLoading ? "..." : stats.totalReplies}</p>
              </div>
            </Card>
          </div>
          
          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search discussions by content or keywords..."
                  className="pl-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Community Filter</span>
              </div>
            </div>
          </Card>

          {/* Virtualized List Container */}
          <div 
            ref={parentRef} 
            className="h-150 overflow-auto pr-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div className="p-8 space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center gap-6">
                    <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <Skeleton className="h-6 w-62.5" />
                      <Skeleton className="h-4 w-45" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : !hasData ? (
              <div className="h-full w-full flex items-center justify-center p-12">
                <EmptyState
                  icon={MessageSquare}
                  title="No discussions found"
                  description="Start a new conversation to engage with your class community."
                  className="border-none bg-transparent min-h-0"
                  action={{
                    label: "Start Discussion",
                    onClick: () => create("discussions"),
                  }}
                />
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const discussion = discussions[virtualItem.index];
                  const lastActivity = dayjs(discussion.updatedAt);
                  
                  return (
                    <div
                      key={virtualItem.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className="px-8"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col md:flex-row items-center h-full border-b border-primary/5 hover:bg-primary/[0.02] transition-all group cursor-pointer"
                        onClick={() => show("discussions", discussion.id)}
                      >
                        {/* Author Avatar */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          <Avatar className="h-16 w-16 rounded-2xl border-4 border-background shadow-lg group-hover:scale-110 transition-transform">
                            <AvatarImage src={discussion.user.image ?? undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                              {discussion.user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-2 -right-2 bg-background p-1 rounded-lg shadow-md">
                              <div className={cn(
                                  "p-1 rounded-md",
                                  discussion.user.role === UserRole.TEACHER ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                              )}>
                                  {discussion.user.role === UserRole.TEACHER ? <Sparkles className="h-3 w-3" /> : <User className="h-3 w-3" />}
                              </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ml-8 text-center md:text-left min-w-0 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
                              {discussion.content}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge 
                                  variant="outline" 
                                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
                              >
                                  {(discussion as any).class?.name || "General"}
                              </Badge>
                              {discussion.replies && discussion.replies.length > 5 && (
                                  <Badge className="bg-orange-500/10 text-orange-600 border-none font-black px-2 py-0.5 rounded-md text-[9px] tracking-widest uppercase">
                                      Trending
                                  </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-xs font-bold text-foreground/80">
                                  {discussion.user.name}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">•</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                  {discussion.user.role}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-xs font-bold">
                                  {discussion.replies?.length || 0} <span className="text-muted-foreground/50 font-medium">Replies</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-tight">
                                  Active {lastActivity.fromNow()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                          <Button
                            variant="outline"
                            className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            View Thread
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>

                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl md:hidden lg:flex" onClick={(e) => e.stopPropagation()}>
                                      <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Thread Options</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => show("discussions", discussion.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                      <Eye className="h-4 w-4 text-primary" />
                                      <span className="font-bold">Open Discussion</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer">
                                      <Activity className="h-4 w-4 text-primary" />
                                      <span className="font-bold">Follow Thread</span>
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ListView>
    </div>
  );
};

export default DiscussionsListPage;
