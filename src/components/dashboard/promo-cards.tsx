import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Info, Wand2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import React from "react";

interface PromoCardsProps {
  isStaff: boolean;
  list: (resource: string) => void;
}

export const PromoCards = ({ isStaff, list }: PromoCardsProps) => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    return (
        <div className="space-y-8">
            {isStaff && (
                <motion.div
                  whileHover={{ y: -5, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Card 
                    className="relative group cursor-pointer overflow-hidden border-none shadow-2xl bg-ai-primary/[0.03] backdrop-blur-xl rounded-[2rem] border border-ai-primary/10 text-start" 
                    onClick={() => list("ai-assistant")}
                  >
                      {/* Premium Background Effects */}
                      <div className="absolute top-0 end-0 w-64 h-64 bg-ai-primary/10 rounded-full blur-[80px] -me-32 -mt-32 pointer-events-none group-hover:bg-ai-primary/20 transition-colors duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shine_3s_infinite] pointer-events-none" />
                      
                      <div className="absolute end-[-1rem] top-[-1rem] p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 rtl:-rotate-12 ltr:rotate-12 group-hover:rotate-0 group-hover:scale-125 pointer-events-none">
                          <Sparkles className="h-32 w-32 text-ai-primary" />
                      </div>

                      <CardHeader className="p-8 pb-4 relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-ai-primary/10 text-ai-primary group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                <Sparkles className="h-6 w-6 animate-pulse" />
                              </div>
                              <CardTitle className={cn(
                                "text-2xl",
                                isArabic ? "font-bold" : "font-black tracking-tighter"
                              )}>
                                {t("dashboard.staff.promos.aiAssistant.title")}
                              </CardTitle>
                            </div>
                            <Badge variant="secondary" className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-ai-primary/10 text-ai-primary border-none shadow-sm">
                              {t("dashboard.staff.promos.aiAssistant.badge")}
                            </Badge>
                          </div>
                      </CardHeader>
                      
                      <CardContent className="p-8 pt-2 space-y-8 relative z-10">
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                              {t("dashboard.staff.promos.aiAssistant.description").split("Gemini 2.0 Flash").map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && <span className="text-ai-primary font-black">Gemini 2.0 Flash</span>}
                                </React.Fragment>
                              ))}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { icon: Wand2, label: t("dashboard.staff.promos.aiAssistant.quizGen") },
                              { icon: MessageSquare, label: t("dashboard.staff.promos.aiAssistant.aiChat") }
                            ].map((feat) => (
                              <div key={feat.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-border/40 shadow-sm">
                                <feat.icon className="h-4 w-4 text-ai-primary/60" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{feat.label}</span>
                              </div>
                            ))}
                          </div>

                          <Button className="w-full h-14 bg-ai-primary hover:bg-ai-primary/90 border-none font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-ai-primary/20 group-hover:gap-4 transition-all text-white relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
                              {t("buttons.tryItNow")} 
                              <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", isArabic && "rotate-180 group-hover:-translate-x-1")} />
                          </Button>
                      </CardContent>
                  </Card>
                </motion.div>
            )}

            {!isStaff && (
                <motion.div
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden group text-start">
                      <div className="h-1.5 bg-primary/20 w-full transition-all duration-500 group-hover:bg-primary" />
                      <CardHeader className="p-8 pb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/5">
                              <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className={cn(
                                "text-xl",
                                isArabic ? "font-bold" : "font-black tracking-tight"
                              )}>
                                {t("dashboard.staff.promos.studentSupport.title")}
                              </CardTitle>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t("dashboard.staff.promos.studentSupport.badge")}</p>
                            </div>
                          </div>
                      </CardHeader>
                      <CardContent className="p-8 pt-2 space-y-6">
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                            {t("dashboard.staff.promos.studentSupport.description").split("AI Study Buddy").map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && <span className="text-primary font-black">AI Study Buddy</span>}
                                </React.Fragment>
                            ))}
                          </p>
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                            <Info className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                              {t("dashboard.staff.promos.studentSupport.technicalNote")}
                            </p>
                          </div>
                          <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 text-primary transition-all shadow-sm">
                            {t("buttons.contactSupport")}
                            <ArrowRight className={cn("h-4 w-4", isArabic && "rotate-180")} />
                          </Button>
                      </CardContent>
                  </Card>
                </motion.div>
            )}
        </div>
    );
};
