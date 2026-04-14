import React, { useState } from "react";
import { useCustom } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Loader2, Search, Flame, Calendar, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

dayjs.extend(relativeTime);

interface SpacedRepetition {
  id: number;
  topic: string;
  masteryLevel: number;
  nextReviewAt: string;
  lastReviewedAt: string;
  interval: number;
}

const MemoryLabPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { result, query } = useCustom<SpacedRepetition[]>({
    url: "/ai/memory-boosters",
    method: "get",
  });

  const boosters = result?.data || [];
  const isLoading = query.isLoading;

  const filteredBoosters = boosters.filter((b: SpacedRepetition) =>
    b.topic.toLowerCase().includes(search.toLowerCase())
  );

  const dueItems = boosters.filter((b: SpacedRepetition) =>
    dayjs(b.nextReviewAt).isBefore(dayjs().add(1, "hour"))
  );

  const averageMastery = boosters.length
    ? Math.round(
        boosters.reduce((acc: number, curr: SpacedRepetition) => acc + curr.masteryLevel, 0) /
          boosters.length
      )
    : 0;

  const handleStartSession = (topic: string) => {
    navigate(`/ai-study-lab?topic=${encodeURIComponent(topic)}`);
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Syncing Memory Palace...
        </p>
      </div>
    );
  }

  return (
    <div className="container-center section-wrapper !pt-10 space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 text-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest">
            <Brain className="h-3.5 w-3.5" />
            AI Memory Lab
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-gradient">
            Knowledge <span className="text-orange-500/30">Mastery</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl">
            Retain what you learn forever using the SM-2 algorithm. Your AI tutor tracks every
            struggle and schedules the perfect time to review.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card border border-border/40 p-6 rounded-[2.5rem] shadow-xl">
          <div className="text-center px-6 border-e border-border/40">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              Avg. Mastery
            </p>
            <p className="text-4xl font-black text-orange-500">{averageMastery}%</p>
          </div>
          <div className="text-center px-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              Active Topics
            </p>
            <p className="text-4xl font-black">{boosters.length}</p>
          </div>
        </div>
      </header>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 ai-card-premium overflow-hidden">
          <div className="ai-glow opacity-20" />
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Mastery Heatmap
                </CardTitle>
                <CardDescription className="font-bold uppercase text-[10px] tracking-widest">
                  Visualizing your knowledge distribution
                </CardDescription>
              </div>
              <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {boosters.map((b: SpacedRepetition) => (
                <motion.div
                  key={b.id}
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center text-[10px] font-black border border-white/10 shadow-lg",
                    b.masteryLevel > 80
                      ? "bg-green-500/20 text-green-500"
                      : b.masteryLevel > 50
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-destructive/20 text-destructive"
                  )}
                  title={`${b.topic}: ${b.masteryLevel}%`}
                >
                  {b.masteryLevel}%
                </motion.div>
              ))}
              {Array.from({ length: Math.max(0, 20 - boosters.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square rounded-xl bg-muted/20 border border-dashed border-border/40"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-orange-500/20 to-ai-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute start-6 h-5 w-5 text-muted-foreground/40" />
              <Input
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-16 ps-16 pe-8 rounded-full bg-card border-border/40 shadow-xl font-bold placeholder:text-muted-foreground/20"
              />
            </div>
          </div>

          <Card className="rounded-[2.5rem] bg-card border-border/40 shadow-xl overflow-hidden">
            <CardHeader className="bg-orange-500/10 p-8">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-orange-600">
                <Zap className="h-5 w-5" />
                Due Today
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {dueItems.length > 0 ? (
                dueItems.slice(0, 3).map((item: SpacedRepetition) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <p className="text-sm font-black truncate">{item.topic}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white"
                      onClick={() => handleStartSession(item.topic)}
                    >
                      Review
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-muted-foreground text-center py-4 uppercase tracking-widest">
                  Memory Crystal Clear!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Knowledge Catalog</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-full px-4 font-black uppercase text-[10px]">
              {filteredBoosters.length} Topics
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBoosters.map((item: SpacedRepetition, idx: number) => {
              const isDue = dayjs(item.nextReviewAt).isBefore(dayjs().add(1, "hour"));
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card
                    className={cn(
                      "group relative rounded-[2.5rem] p-8 border-border/40 hover:border-orange-500/30 transition-all duration-500 cursor-pointer",
                      isDue ? "bg-orange-500/5 ring-2 ring-orange-500/20" : "bg-card"
                    )}
                    onClick={() => handleStartSession(item.topic)}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={cn(
                          "p-4 rounded-2xl",
                          isDue ? "bg-orange-500 text-white" : "bg-muted/50 text-muted-foreground"
                        )}
                      >
                        <Brain className="h-6 w-6" />
                      </div>
                      {isDue && (
                        <Badge className="bg-orange-500 text-white border-none animate-pulse uppercase text-[9px] font-black tracking-widest">
                          Due Now
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-black leading-tight tracking-tight line-clamp-2">
                        {item.topic}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Mastery</span>
                          <span>{item.masteryLevel}%</span>
                        </div>
                        <Progress
                          value={item.masteryLevel}
                          className="h-1.5"
                          indicatorClassName={cn(
                            item.masteryLevel > 80
                              ? "bg-green-500"
                              : item.masteryLevel > 50
                                ? "bg-orange-500"
                                : "bg-destructive"
                          )}
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-border/40">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Calendar className="h-3.5 w-3.5" />
                          {isDue ? "Review Now" : `Next: ${dayjs(item.nextReviewAt).fromNow()}`}
                        </div>
                        <ArrowRight className="h-4 w-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredBoosters.length === 0 && (
          <div className="text-center py-40 space-y-6 bg-muted/10 rounded-[4rem] border border-dashed border-border/40">
            <div className="p-8 rounded-full bg-muted/30 w-fit mx-auto">
              <Brain className="h-12 w-12 text-muted-foreground/20" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">No Topics Found</h2>
            <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">
              Keep learning to populate your memory palace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryLabPage;
