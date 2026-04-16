import {} from "framer-motion";
import {
  Mail,
  Phone,
  Building2,
  Clock,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  Tv,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { XPProgressBar } from "@/features/engagement/components/xp-progress-bar";
import { getLevelProgress } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { User, VerificationStatus } from "@/types";

interface Props {
  user: User;
  isStudent: boolean;
  isTeacher: boolean;
}

export const ProfileCard = ({ user, isStudent, isTeacher }: Props) => {
  const { t, i18n } = useTranslation();
  const { currentLevel } = getLevelProgress(user.xp || 0);
  const formatter = new Intl.NumberFormat(i18n.language);

  const renderVerificationBadge = () => {
    switch (user.verificationStatus) {
      case VerificationStatus.VERIFIED:
        return (
          <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 font-black px-3 py-1 rounded-full text-[10px] tracking-widest shadow-sm">
            <CheckCircle2 className={cn("w-3 h-3", "me-1")} />
            {t("users.governance.verification.verified" as any)}
          </Badge>
        );
      case VerificationStatus.PENDING:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-black px-3 py-1 rounded-full text-[10px] tracking-widest shadow-sm">
            <Clock className={cn("w-3 h-3", "me-1")} />
            {t("users.governance.verification.pending" as any)}
          </Badge>
        );
      case VerificationStatus.REJECTED:
        return (
          <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 font-black px-3 py-1 rounded-full text-[10px] tracking-widest shadow-sm">
            <XCircle className={cn("w-3 h-3", "me-1")} />
            {t("users.governance.toasts.rejected" as any)}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 md:space-y-16">
      <Card className="overflow-hidden border-border/40 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl">
        <div className="h-32 bg-linear-to-br from-primary/20 via-primary/10 to-transparent relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>
        <CardContent className="relative pt-0 flex flex-col items-center text-center px-6 md:px-8 pb-10 md:pb-12 text-start">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 border-8 border-background -mt-16 shadow-2xl rounded-4xl md:rounded-[2.5rem]">
            <AvatarImage src={user.image ?? ""} className="object-cover" />
            <AvatarFallback className="text-4xl md:text-5xl font-black bg-primary text-primary-foreground">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="mt-6 space-y-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">
              {user.name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className="capitalize font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest shadow-sm"
              >
                {t(`roles.${user.role.toLowerCase()}` as any)}
              </Badge>
              {renderVerificationBadge()}
            </div>
          </div>

          {isStudent && (
            <div className="w-full mt-8 space-y-6 bg-primary/5 p-6 rounded-4xl border border-primary/5 shadow-inner">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col items-start">
                  <span className="text-3xl md:text-4xl font-black text-primary">
                    {formatter.format(currentLevel)}
                  </span>
                  <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
                    {t("profile.labels.level" as any)}
                  </span>
                </div>
                <div className="h-10 w-px bg-primary/10" />
                <div className="flex flex-col items-end">
                  <span className="text-3xl md:text-4xl font-black text-primary">
                    {formatter.format(user.xp || 0)}
                  </span>
                  <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
                    {t("profile.labels.totalXp" as any)}
                  </span>
                </div>
              </div>
              <XPProgressBar xp={user.xp || 0} />
            </div>
          )}

          {isStudent && (
            <div className="w-full mt-4 grid grid-cols-2 gap-4">
              <div className="bg-orange-500/10 p-4 md:p-6 rounded-2xl border border-orange-500/10 flex flex-col items-center shadow-sm text-start">
                <Flame className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mb-1" />
                <span className="text-xl md:text-2xl font-black text-orange-600">
                  {formatter.format(user.currentStreak || 0)}
                </span>
                <span className="text-[10px] md:text-[11px] uppercase font-black text-orange-600/60 tracking-widest">
                  {t("profile.labels.currentStreak" as any)}
                </span>
              </div>
              <div className="bg-primary/10 p-4 md:p-6 rounded-2xl border border-primary/10 flex flex-col items-center shadow-sm text-start">
                <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary mb-1" />
                <span className="text-xl md:text-2xl font-black text-primary">
                  {formatter.format(user.longestStreak || 0)}
                </span>
                <span className="text-[10px] md:text-[11px] uppercase font-black text-primary/60 tracking-widest">
                  {t("profile.labels.longestStreak" as any)}
                </span>
              </div>
            </div>
          )}

          <div className="w-full mt-10 space-y-5 text-start">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
                  {t("profile.labels.email" as any)}
                </span>
                <span className="font-bold truncate text-sm md:text-base">{user.email}</span>
              </div>
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
                    {t("profile.labels.phone" as any)}
                  </span>
                  <span className="font-bold text-sm md:text-base">{user.phoneNumber}</span>
                </div>
              </div>
            )}
            {user.department && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
                    {t("profile.labels.department" as any)}
                  </span>
                  <span className="font-bold text-sm md:text-base">{user.department.name}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
                  {t("profile.labels.memberSince" as any)}
                </span>
                <span className="font-bold text-sm md:text-base">
                  {new Date(user.createdAt).toLocaleDateString(
                    i18n.language === "ar" ? "ar-EG" : "en-US",
                    { month: "long", year: "numeric" }
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isTeacher && user.teacherChannel && (
        <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden p-6 md:p-8 text-start">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
              <Tv className="h-5 w-5" />
            </div>
            <h4 className="text-xl md:text-2xl font-black tracking-tight">
              {t("teacherChannel.labels.stats" as any)}
            </h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base font-bold text-muted-foreground">
                {t("teacherChannel.labels.views" as any)}
              </span>
              <span className="text-lg md:text-xl font-black">
                {user.teacherChannel.totalViews.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base font-bold text-muted-foreground">
                {t("teacherChannel.labels.conversion" as any)}
              </span>
              <span className="text-lg md:text-xl font-black text-primary">
                {(user.teacherChannel.conversionRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
