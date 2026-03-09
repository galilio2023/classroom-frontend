import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Info, Wand2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PromoCardsProps {
  isStaff: boolean;
  list: (resource: string) => void;
}

export const PromoCards = ({ isStaff, list }: PromoCardsProps) => (
    <div className="space-y-8">
        {isStaff && (
            <motion.div
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Card 
                className="relative group cursor-pointer overflow-hidden border-none shadow-2xl bg-ai-primary/[0.03] backdrop-blur-xl rounded-[2rem] border border-ai-primary/10" 
                onClick={() => list("ai-assistant")}
              >
                  {/* Premium Background Effects */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-ai-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-ai-primary/20 transition-colors duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shine_3s_infinite] pointer-events-none" />
                  
                  <div className="absolute -right-4 -top-4 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 rotate-12 group-hover:rotate-0 group-hover:scale-125">
                      <Sparkles className="h-32 w-32 text-ai-primary" />
                  </div>

                  <CardHeader className="p-8 pb-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-ai-primary/10 text-ai-primary group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="h-6 w-6 animate-pulse" />
                          </div>
                          <CardTitle className="text-2xl font-black tracking-tighter">AI Assistant</CardTitle>
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-ai-primary/10 text-ai-primary border-none">
                          Premium
                        </Badge>
                      </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 pt-2 space-y-8 relative z-10">
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                          Unlock the power of <span className="text-ai-primary font-black">Gemini 2.0 Flash</span> to generate quizzes, assignments, and get instant curriculum help.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: Wand2, label: "Quiz Gen" },
                          { icon: MessageSquare, label: "AI Chat" }
                        ].map((feat) => (
                          <div key={feat.label} className="flex items-center gap-2 p-2 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-black/[0.03] dark:border-white/[0.03] shadow-sm">
                            <feat.icon className="h-3.5 w-3.5 text-ai-primary/60" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{feat.label}</span>
                          </div>
                        ))}
                      </div>

                      <Button className="w-full h-14 bg-ai-primary hover:bg-ai-primary/90 border-none font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-ai-primary/20 group-hover:gap-4 transition-all text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
                          Try it now 
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
              <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden group">
                  <div className="h-1.5 bg-primary/20 w-full" />
                  <CardHeader className="p-8 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-black tracking-tight">Student Support</CardTitle>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Help & Resources</p>
                        </div>
                      </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-2 space-y-6">
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        Need help with your studies? Use the <span className="text-primary font-bold">AI Study Buddy</span> inside any of your class pages for instant assistance.
                      </p>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <Info className="h-4 w-4 text-primary" />
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                          Our support team is also available 24/7 for technical issues.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 text-primary transition-all">
                        Contact Support
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                  </CardContent>
              </Card>
            </motion.div>
        )}
    </div>
);
