import { useList, useNavigation } from "@refinedev/core";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Search, 
  Sparkles, 
  BookOpen, 
  Layers, 
  FileQuestion,
  Calendar,
  Loader2,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const AIHistoryList = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("resources.ai-history.label", { defaultValue: "AI Study History" }));
  const { show } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const isAr = i18n.language === "ar";

  // Refine v5 useList returns { query, result }
  const { query, result } = useList({
    resource: "ai-activity-logs",
    sorters: [{ field: "createdAt", order: "desc" }],
    filters: [
      {
        field: "prompt", // Fixed: Was 'input'
        operator: "contains",
        value: searchQuery,
      },
    ],
  });

  const { data } = result;
  const { isLoading } = query;

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case "explain": return { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "summary": return { icon: Sparkles, color: "text-green-500", bg: "bg-green-500/10" };
      case "flashcards": return { icon: Layers, color: "text-orange-500", bg: "bg-orange-500/10" };
      case "quiz": return { icon: FileQuestion, color: "text-purple-500", bg: "bg-purple-500/10" };
      default: return { icon: History, color: "text-primary", bg: "bg-primary/10" };
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-20 max-w-7xl mx-auto px-4" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5">
              <History className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                {t("resources.ai-history.label", { defaultValue: "AI Study History" })}
              </h1>
              <p className="text-muted-foreground font-medium">
                {t("aiHub.history.description", { defaultValue: "Review and revisit your previous AI-powered learning sessions." })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 max-w-md bg-card/50 backdrop-blur-xl p-2 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t("buttons.search", { defaultValue: "Search history..." })}
            className="pl-10 border-none bg-transparent shadow-none focus-visible:ring-0 font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading your history...</p>
        </div>
      ) : data?.length === 0 ? (
        <Card className="border-dashed border-2 border-border/40 bg-muted/10 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="p-4 rounded-full bg-muted/20 text-muted-foreground mb-6">
            <History className="h-12 w-12 opacity-20" />
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-2">No history found</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            You haven't saved any AI study sessions yet. Start exploring the AI Study Lab!
          </p>
          <Button asChild size="lg" className="rounded-2xl px-8 font-black uppercase tracking-widest text-[10px]">
            <a href="/ai-study-lab">Go to Study Lab</a>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((log: any, index: number) => {
            const toolInfo = getToolIcon(log.action); // Fixed: Was 'log.tool'
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="group h-full border-border/40 bg-card/40 backdrop-blur-3xl hover:bg-card/60 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
                  onClick={() => show("ai-activity-logs", log.id)}
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-2.5 rounded-xl shadow-sm", toolInfo.bg, toolInfo.color)}>
                        <toolInfo.icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                        <Calendar className="h-3 w-3" />
                        {log.createdAt && format(new Date(log.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-black tracking-tight mt-4 line-clamp-2 min-h-[3.5rem]">
                      {log.prompt} {/* Fixed: Was 'log.input' */}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6">
                    <div className="h-12 line-clamp-2 text-sm text-muted-foreground/80 leading-relaxed font-medium">
                      {log.action === "flashcards" ? "Flashcard Deck generated" : log.response} {/* Fixed: Was tool/output */}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                        {log.action} {/* Fixed: Was 'log.tool' */}
                      </span>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                            <ExternalLink className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIHistoryList;
