import { motion } from "framer-motion";
import { GraduationCap, Trophy, Award, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeCard } from "@/components/ui/badge-card";
import { CertificateGallery } from "@/components/certificate-gallery";
import ReportCard from "@/pages/student/report-card";
import { useTranslation } from "react-i18next";
import { User } from "@/types";

interface Props {
  user: User;
  displayBadges: any[];
  isSelf: boolean;
  isAdmin: boolean;
}

export const StudentPerformanceView = ({ user, displayBadges, isSelf, isAdmin }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-10 md:space-y-16">
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
