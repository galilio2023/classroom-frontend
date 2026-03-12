import { useShow, useGetIdentity, useList } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  FileText, 
  Loader2, 
  Trophy, 
  Award, 
  Flame, 
  Target, 
  Share2,
  Building2,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { User as UserType, UserRole, VerificationStatus } from "@/types";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { getLevelProgress } from "@/lib/xp";
import { BadgeCard, BadgeData } from "@/components/ui/badge-card";
import { CertificateGallery } from "@/components/certificate-gallery";
import { toast } from "sonner";
import ReportCard from "@/pages/student/report-card";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const UserShow = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const { id: paramsId } = useParams();
  const { data: identity } = useGetIdentity<UserType>();
  
  // Logic: Use ID from URL if available, otherwise fallback to current user's ID (for /portfolio)
  const id = paramsId || identity?.id;

  const { query } = useShow<UserType & { userBadges?: any[] }>({
    resource: "users",
    id,
    queryOptions: {
        enabled: !!id
    },
    meta: {
        populate: ["department", "userBadges", "userBadges.badge"]
    }
  });

  // Fetch all available badges from DB
  const { result: badgesResult } = useList<any>({
    resource: "badges",
    pagination: { mode: "off" },
    queryOptions: {
        enabled: !!query.data?.data
    }
  });

  const { data, isLoading, isError } = query;
  const user = data?.data;
  usePageTitle(user?.name ? `${user.name}'s Profile` : t("profile.title"));

  const displayBadges = useMemo(() => {
    if (!user || !badgesResult?.data) return [];

    const earnedBadgeIds = new Set(user.userBadges?.map((ub: any) => ub.badgeId));
    
    const earned = (user.userBadges || []).map((ub: any) => ({
        id: ub.badge.id.toString(),
        name: ub.badge.name,
        description: ub.badge.description || "",
        icon: Trophy,
        color: "bg-gold-primary text-white",
        unlocked: true,
    }));

    const unearned = (badgesResult.data || [])
        .filter((b: any) => !earnedBadgeIds.has(b.id))
        .map((b: any) => ({
            id: b.id.toString(),
            name: b.name,
            description: b.description || t("status.suspended"), 
            icon: Target,
            color: "bg-muted text-muted-foreground",
            unlocked: false,
        }));

    return [...earned, ...unearned];
  }, [user, badgesResult, t]);

  if (isLoading || !id) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-black">{t("profile.notFound")}</h2>
        <p className="text-muted-foreground">{t("profile.notFoundDesc")}</p>
      </div>
    );
  }

  const isSelf = identity?.id === user.id;
  const isAdmin = identity?.role === UserRole.ADMIN;
  const isStudent = user.role === UserRole.STUDENT;
  
  const { currentLevel } = getLevelProgress(user.xp || 0);

  const renderVerificationBadge = () => {
    switch (user.verificationStatus) {
      case VerificationStatus.VERIFIED:
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none font-black px-3 py-1 rounded-lg text-[10px] tracking-widest">
            <CheckCircle2 className={cn("w-3 h-3", isAr ? "ml-1" : "mr-1")} />
            {t("users.governance.verification.verified")}
          </Badge>
        );
      case VerificationStatus.PENDING:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none font-black px-3 py-1 rounded-lg text-[10px] tracking-widest">
            <Clock className={cn("w-3 h-3", isAr ? "ml-1" : "mr-1")} />
            {t("users.governance.verification.pending")}
          </Badge>
        );
      case VerificationStatus.REJECTED:
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none font-black px-3 py-1 rounded-lg text-[10px] tracking-widest">
            <XCircle className={cn("w-3 h-3", isAr ? "ml-1" : "mr-1")} />
            {t("users.governance.toasts.rejected")}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-6xl space-y-10 text-start">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
                    <UserIcon className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight">{t("profile.title")}</h1>
                    <p className="text-muted-foreground font-medium">{t("profile.description")}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6 gap-2 border-primary/10 bg-card/50 backdrop-blur-sm"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success(t("profile.toasts.linkCopied"));
                    }}
                >
                    <Share2 className="w-4 h-4" />
                    {t("buttons.shareProfile")}
                </Button>
                {(isSelf || isAdmin) && (
                    <Button 
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20"
                        asChild
                    >
                        <a href={`/users/edit/${user.id}`}>{t("buttons.editProfile")}</a>
                    </Button>
                )}
            </div>
        </div>
      </motion.div>

      <div className="grid gap-10 md:grid-cols-12">
        {/* Left Column: Profile Card */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 space-y-8"
        >
          <Card className="overflow-hidden border-primary/10 shadow-2xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
            <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>
            <CardContent className="relative pt-0 flex flex-col items-center text-center px-8 pb-10">
              <Avatar className="h-32 w-32 border-8 border-background -mt-16 shadow-2xl rounded-[2rem]">
                <AvatarImage src={user.image ?? ""} className="object-cover" />
                <AvatarFallback className="text-4xl font-black bg-primary text-primary-foreground">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-6 space-y-2">
                <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
                <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="capitalize font-black px-4 py-1 rounded-lg text-[10px] tracking-widest">
                        {t(`roles.${user.role.toLowerCase()}` as any)}
                    </Badge>
                    {renderVerificationBadge()}
                </div>
              </div>
              
              {isStudent && (
                <div className="w-full mt-8 space-y-6 bg-primary/5 p-6 rounded-[2rem] border border-primary/5">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col items-start">
                      <span className="text-3xl font-black text-primary">{new Intl.NumberFormat(i18n.language).format(currentLevel)}</span>
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("profile.labels.level")}</span>
                    </div>
                    <div className="h-10 w-px bg-primary/10" />
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-black text-primary">{new Intl.NumberFormat(i18n.language).format(user.xp || 0)}</span>
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("profile.labels.totalXp")}</span>
                    </div>
                  </div>
                  <XPProgressBar xp={user.xp || 0} />
                </div>
              )}

              {isStudent && (
                <div className="w-full mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/10 flex flex-col items-center">
                    <Flame className="h-6 w-6 text-orange-500 mb-1" />
                    <span className="text-xl font-black text-orange-600">{new Intl.NumberFormat(i18n.language).format(user.currentStreak || 0)}</span>
                    <span className="text-[8px] uppercase font-black text-orange-600/60 tracking-widest">{t("profile.labels.currentStreak")}</span>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-2xl border border-primary/10 flex flex-col items-center">
                    <Trophy className="h-6 w-6 text-primary mb-1" />
                    <span className="text-xl font-black text-primary">{new Intl.NumberFormat(i18n.language).format(user.longestStreak || 0)}</span>
                    <span className="text-[8px] uppercase font-black text-primary/60 tracking-widest">{t("profile.labels.longestStreak")}</span>
                  </div>
                </div>
              )}
              
              <div className="w-full mt-10 space-y-5 text-start">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-primary/5">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Mail className="h-5 w-5" /></div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("profile.labels.email")}</span>
                    <span className="font-bold truncate text-sm">{user.email}</span>
                  </div>
                </div>

                {user.phoneNumber && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-primary/5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Phone className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("profile.labels.phone")}</span>
                      <span className="font-bold text-sm">{user.phoneNumber}</span>
                    </div>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-primary/5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Building2 className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("profile.labels.department")}</span>
                      <span className="font-bold text-sm">{user.department.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-primary/5">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Clock className="h-5 w-5" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("profile.labels.memberSince")}</span>
                    <span className="font-bold text-sm">{new Date(user.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Details & Bio */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-8 space-y-10"
        >
          <Card className="border-primary/10 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">{t("profile.labels.bio")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="space-y-4">
                <p className="text-base leading-relaxed text-foreground/80 font-medium whitespace-pre-wrap">
                  {user.bio || t("profile.placeholders.noBio")}
                </p>
              </div>

              {user.address && (
                <div className="pt-6 border-t border-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("profile.labels.address")}</h4>
                  </div>
                  <p className={cn("text-sm font-bold text-foreground/80", isAr ? "mr-6" : "ml-6")}>{user.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {isStudent && (
            <>
              {/* Report Card Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-primary/10 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-2xl font-black tracking-tight">{t("profile.sections.report")}</CardTitle>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-xl text-[10px] tracking-widest">
                                {t("profile.labels.currentTerm")}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {isSelf || isAdmin ? (
                            <ReportCard />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/20 rounded-[2rem] border-2 border-dashed border-primary/10">
                                <Shield className="h-12 w-12 text-muted-foreground/20" />
                                <div className="space-y-1">
                                    <p className="font-black uppercase tracking-widest text-xs text-muted-foreground">{t("profile.privacy.note")}</p>
                                    <p className="text-sm text-muted-foreground/60 font-medium">{t("profile.privacy.reportHidden")}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-primary/10 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">{t("profile.sections.achievements")}</CardTitle>
                        </div>
                        <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl border-primary/10">
                            {t("profile.labels.earned", { 
                                count: displayBadges.filter(b => b.unlocked).length,
                                total: displayBadges.length,
                                defaultValue: `${displayBadges.filter(b => b.unlocked).length} / ${displayBadges.length} Earned`
                            })}
                        </Badge>
                    </div>
                    </CardHeader>
                    <CardContent className="p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {displayBadges.map((badge: BadgeData) => (
                        <BadgeCard key={badge.id} badge={badge} />
                        ))}
                    </div>
                    </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-primary/10 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Award className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">{t("profile.sections.certificates")}</CardTitle>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="p-8">
                    <CertificateGallery studentName={user.name} isOwner={isSelf} />
                    </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {(isSelf || isAdmin) && (
            <div className="pt-6 flex justify-center">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-primary/5 px-6 py-2 rounded-full">
                <Shield className={cn("w-3 h-3", isAr ? "ml-2" : "mr-2")} />
                {t("profile.privacy.adminOnly")}
              </Badge>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserShow;
