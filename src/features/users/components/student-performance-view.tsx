import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Trophy,
  Award,
  Shield,
  BrainCircuit,
  Zap,
  Target,
  Sparkles,
  Loader2,
  X,
  Presentation,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeCard } from "@/components/ui/badge-card";
import { CertificateGallery } from "@/features/academic/components/certificate-gallery";
import ReportCard from "@/features/users/pages/student/report-card";
import { useTranslation } from "react-i18next";
import { User } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

interface Props {
  user: User;
  displayBadges: any[];
  isSelf: boolean;
  isAdmin: boolean;
}

export const StudentPerformanceView = ({ user, displayBadges, isSelf, isAdmin }: Props) => {
  const { t } = useTranslation();
  const [isPivotOpen, setIsPivotOpen] = useState(false);
  const [pivotContent, setPivotContent] = useState<string | null>(null);

  const { mutate: getPivot, mutation: pivotMutation } = useCustomMutation();
  const isPivotLoading = pivotMutation.isPending;

  const handlePedagogicalPivot = () => {
    getPivot(
      {
        url: "/ai/pedagogical-pivot",
        method: "post",
        values: {
          studentId: user.id,
          learningDNA: user.persona?.learningDNA,
        },
      },
      {
        onSuccess: (result: any) => {
          setPivotContent(result.data?.pivotContent || "Unable to generate pivot at this time.");
          setIsPivotOpen(true);
        },
        onError: () => {
          toast.error("Failed to generate pedagogical pivot.");
        },
      }
    );
  };

  return (
    <div className="space-y-10 md:space-y-16">
      {/* 🧠 Learning DNA Section */}
      {user.persona && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-none shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-indigo-950 text-white overflow-hidden text-start">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <BrainCircuit className="h-64 w-64 rotate-12" />
            </div>

            <CardHeader className="p-8 md:p-12 pb-4 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-white/10 text-white shadow-xl backdrop-blur-xl border border-white/10">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">
                      {t("profile.sections.learningDNA" as any, "Learning DNA")}
                    </CardTitle>
                    <p className="text-indigo-200/60 font-medium text-sm">
                      {t(
                        "profile.dna.subtitle" as any,
                        "Synthesized by AI from your learning behavior"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(!isSelf || isAdmin) && (
                    <Button
                      onClick={handlePedagogicalPivot}
                      disabled={isPivotLoading}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 px-6 gap-2 backdrop-blur-xl transition-all shadow-2xl shadow-indigo-500/20"
                    >
                      {isPivotLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      {t("profile.dna.pivot" as any, "Instructional Pivot")}
                    </Button>
                  )}
                  <Badge className="bg-indigo-500 text-white border-none font-black px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] shadow-2xl h-10 flex items-center">
                    {t("profile.dna.active" as any, "AI Optimized")}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 md:p-12 relative z-10 space-y-10">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg md:text-xl leading-relaxed text-indigo-100/90 font-medium italic">
                  "{user.persona.learningDNA}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4">
                  <div className="flex items-center gap-3 text-amber-400">
                    <Target className="h-5 w-5" />
                    <h4 className="font-black uppercase tracking-widest text-xs">
                      {t("profile.dna.struggles" as any, "Conceptual Hurdles")}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {((user.persona as any)?.struggleHistory || []).map(
                      (topic: string, i: number) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-white/5 border-white/10 text-white px-3 py-1 rounded-lg"
                        >
                          {topic}
                        </Badge>
                      )
                    )}
                    {(!(user.persona as any)?.struggleHistory ||
                      (user.persona as any)?.struggleHistory?.length === 0) && (
                      <span className="text-indigo-200/40 text-sm italic font-medium">
                        No persistent struggles identified. Keep it up!
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4">
                  <div className="flex items-center gap-3 text-indigo-400">
                    <Zap className="h-5 w-5" />
                    <h4 className="font-black uppercase tracking-widest text-xs">
                      {t("profile.dna.tone" as any, "Preferred Tone")}
                    </h4>
                  </div>
                  <Badge className="bg-indigo-400/20 text-indigo-300 border-indigo-400/20 px-4 py-1.5 rounded-xl font-bold capitalize">
                    {user.persona.preferredTone}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 🧠 PEDAGOGICAL PIVOT DIALOG */}
      <Dialog open={isPivotOpen} onOpenChange={setIsPivotOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white text-indigo-950 text-start">
          <div className="p-8 md:p-12 bg-indigo-950 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Presentation className="h-32 w-32" />
            </div>
            <DialogHeader className="relative z-10 text-start">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-white/10 text-white backdrop-blur-xl border border-white/10">
                  <Sparkles className="h-6 w-6 text-amber-400" />
                </div>
                <Badge className="bg-amber-500 text-white border-none font-black px-4 py-1 rounded-full text-[8px] uppercase tracking-widest">
                  AI Generated Strategy
                </Badge>
              </div>
              <DialogTitle className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                Instructional Pivot for {user.name.split(" ")[0]}
              </DialogTitle>
              <DialogDescription className="text-indigo-200/60 font-medium text-lg mt-2">
                Custom pedagogical strategy based on {user.name.split(" ")[0]}'s Learning DNA.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[60vh] p-8 md:p-12">
            <div className="prose prose-indigo max-w-none text-indigo-900 leading-relaxed text-lg font-medium space-y-6">
              <ReactMarkdown>{pivotContent || ""}</ReactMarkdown>
            </div>
          </ScrollArea>

          <div className="p-8 md:p-10 border-t border-indigo-50 bg-indigo-50/30 flex justify-end">
            <Button
              onClick={() => setIsPivotOpen(false)}
              className="rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-white font-black uppercase tracking-widest px-8 h-14"
            >
              Apply to Lesson
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Card Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden text-start">
          <CardHeader className="p-8 md:p-10 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-black tracking-tight">
                  {t("profile.sections.report" as any)}
                </CardTitle>
              </div>
              <Badge className="bg-primary/10 text-primary border border-primary/20 font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest shadow-sm">
                {t("profile.labels.currentTerm" as any)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-10">
            {isSelf || isAdmin ? (
              <ReportCard />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/20 rounded-4xl border-2 border-dashed border-border/40">
                <Shield className="h-12 w-12 text-muted-foreground/20" />
                <div className="space-y-1">
                  <p className="font-black uppercase tracking-widest text-xs text-muted-foreground">
                    {t("profile.privacy.note" as any)}
                  </p>
                  <p className="text-sm text-muted-foreground/60 font-medium">
                    {t("profile.privacy.reportHidden" as any)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden text-start">
          <CardHeader className="p-8 md:p-10 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shadow-sm border border-amber-500/20">
                  <Trophy className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-black tracking-tight">
                  {t("profile.sections.achievements" as any)}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-primary/20 font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest shadow-sm"
              >
                {t("profile.labels.earned" as any, {
                  count: displayBadges.filter((b) => b.unlocked).length,
                  total: displayBadges.length,
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {displayBadges.map((badge: any) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Certificates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden text-start">
          <CardHeader className="p-8 md:p-10 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                  <Award className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-black tracking-tight">
                  {t("profile.sections.certificates" as any)}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-10">
            <CertificateGallery studentName={user.name} isOwner={isSelf} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
