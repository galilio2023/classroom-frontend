import { useShow, useGetIdentity, useList } from "@refinedev/core";
import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
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
  Tv,
  Users,
  ArrowRight
} from "lucide-react";
import { User as UserType, UserRole, VerificationStatus, Class } from "@/types";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { getLevelProgress } from "@/lib/xp";
import { BadgeCard, BadgeData } from "@/components/ui/badge-card";
import { CertificateGallery } from "@/components/certificate-gallery";
import { toast } from "sonner";
import ReportCard from "@/pages/student/report-card";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const UserShow = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const { id: paramsId } = useParams();
  const { data: identity } = useGetIdentity<UserType>();
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  
  const id = paramsId || identity?.id;

  const { query } = useShow<UserType & { userBadges?: any[] }>({
    resource: "users",
    id,
    queryOptions: {
        enabled: !!id
    },
    meta: {
        populate: ["department", "userBadges", "userBadges.badge", "teacherChannel"]
    }
  });

  const { result: badgesResult } = useList<any>({
    resource: "badges",
    pagination: { mode: "off" },
    queryOptions: {
        enabled: !!query.data?.data
    }
  });

  const { result: teacherClassesResult } = useList<Class>({
    resource: "classes",
    filters: [
        { field: "teacherUid", operator: "eq", value: id }
    ],
    queryOptions: {
        enabled: !!query.data?.data && query.data.data.role === UserRole.TEACHER
    }
  });

  const teacherClasses = teacherClassesResult.data;

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
            description: b.description || t("status.suspended" as any), 
            icon: Target,
            color: "bg-muted text-muted-foreground",
            unlocked: false,
        }));

    return [...earned, ...unearned];
  }, [user, badgesResult, t]);

  if (isLoading || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
        >
          <div className="absolute -inset-5 rounded-full bg-primary/5 animate-ping duration-3000" />
          <Loader2 className="h-20 w-20 animate-spin text-primary/10 stroke-1" />
          <div className="absolute inset-0 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-primary/30" />
          </div>
        </motion.div>
        <div className="text-center space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
                {t("profile.loading" as any)}
            </h2>
            <p className="text-xs font-medium text-muted-foreground/60 italic">Fetching user details and achievements...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto py-32 text-center space-y-8">
        <div className="p-8 rounded-[2.5rem] bg-destructive/5 text-destructive w-fit mx-auto border border-destructive/10">
          <XCircle className="h-20 w-20" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight">
            {t("profile.notFound" as any)}
          </h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg">
            {t("profile.notFoundDesc" as any)}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[10px]"
        >
          <Link to="/users">{t("buttons.goBack" as any)}</Link>
        </Button>
      </div>
    );
  }

  const isSelf = identity?.id === user.id;
  const isAdmin = identity?.role === UserRole.ADMIN;
  const isStudent = user.role === UserRole.STUDENT;
  const isTeacher = user.role === UserRole.TEACHER;
  
  const { currentLevel } = getLevelProgress(user.xp || 0);

  const renderVerificationBadge = () => {
    switch (user.verificationStatus) {
      case VerificationStatus.VERIFIED:
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 font-black px-3 py-1 rounded-full text-[10px] tracking-widest shadow-sm">
            <CheckCircle2 className={cn("w-3 h-3", isAr ? "ml-1" : "mr-1")} />
            {t("users.governance.verification.verified" as any)}
          </Badge>
        );
      case VerificationStatus.PENDING:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 font-black px-3 py-1 rounded-full text-[10px] tracking-widest shadow-sm">
            <Clock className={cn("w-3 h-3", isAr ? "ml-1" : "mr-1")} />
            {t("users.governance.verification.pending" as any)}
          </Badge>
        );
      case VerificationStatus.REJECTED:
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 font-black px-3 py-1 rounded-full text-[10px] tracking-widest shadow-sm">
            <XCircle className={cn("w-3 h-3", isAr ? "ml-1" : "mr-1")} />
            {t("users.governance.toasts.rejected" as any)}
          </Badge>
        );
      default:
        return null;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
  };

  return (
    <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto py-8 md:py-12 max-w-7xl space-y-10 md:space-y-16"
    >
      <div className="space-y-4 md:space-y-6">
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                    <UserIcon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-balance">{t("profile.title" as any)}</h1>
                    <p className="text-muted-foreground font-medium max-w-xl text-balance">{t("profile.description" as any)}</p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full md:w-auto rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 md:h-14 px-6 md:px-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
                    onClick={() => {
                        void navigator.clipboard.writeText(window.location.href);
                        toast.success(t("profile.toasts.linkCopied" as any));
                    }}
                >
                    <Share2 className="w-4 h-4" />
                    {t("buttons.shareProfile" as any)}
                </Button>
                {(isSelf || isAdmin) && (
                    <Button 
                        size="lg"
                        className="w-full md:w-auto rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 shadow-lg shadow-primary/25"
                        asChild
                    >
                        <Link to={`/users/edit/${user.id}`}>{t("buttons.editProfile" as any)}</Link>
                    </Button>
                )}
            </div>
        </div>
      </div>

      <div className="grid gap-10 md:gap-16 lg:grid-cols-12">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-10 md:space-y-16">
          <Card className="overflow-hidden border-border/40 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl">
            <div className="h-32 bg-linear-to-br from-primary/20 via-primary/10 to-transparent relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>
            <CardContent className="relative pt-0 flex flex-col items-center text-center px-6 md:px-8 pb-10 md:pb-12">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-8 border-background -mt-16 shadow-2xl rounded-4xl md:rounded-[2.5rem]">
                <AvatarImage src={user.image ?? ""} className="object-cover" />
                <AvatarFallback className="text-4xl md:text-5xl font-black bg-primary text-primary-foreground">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-6 space-y-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">{user.name}</h2>
                <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="capitalize font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest shadow-sm">
                        {t(`roles.${user.role.toLowerCase()}` as any)}
                    </Badge>
                    {renderVerificationBadge()}
                </div>
              </div>
              
              {isStudent && (
                <div className="w-full mt-8 space-y-6 bg-primary/5 p-6 rounded-4xl border border-primary/5 shadow-inner">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col items-start">
                      <span className="text-3xl md:text-4xl font-black text-primary">{new Intl.NumberFormat(i18n.language).format(currentLevel)}</span>
                      <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">{t("profile.labels.level" as any)}</span>
                    </div>
                    <div className="h-10 w-px bg-primary/10" />
                    <div className="flex flex-col items-end">
                      <span className="text-3xl md:text-4xl font-black text-primary">{new Intl.NumberFormat(i18n.language).format(user.xp || 0)}</span>
                      <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">{t("profile.labels.totalXp" as any)}</span>
                    </div>
                  </div>
                  <XPProgressBar xp={user.xp || 0} />
                </div>
              )}

              {isStudent && (
                <div className="w-full mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-orange-500/10 p-4 md:p-6 rounded-2xl border border-orange-500/10 flex flex-col items-center shadow-sm">
                    <Flame className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mb-1" />
                    <span className="text-xl md:text-2xl font-black text-orange-600">{new Intl.NumberFormat(i18n.language).format(user.currentStreak || 0)}</span>
                    <span className="text-[8px] uppercase font-black text-orange-600/60 tracking-widest">{t("profile.labels.currentStreak" as any)}</span>
                  </div>
                  <div className="bg-primary/10 p-4 md:p-6 rounded-2xl border border-primary/10 flex flex-col items-center shadow-sm">
                    <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary mb-1" />
                    <span className="text-xl md:text-2xl font-black text-primary">{new Intl.NumberFormat(i18n.language).format(user.longestStreak || 0)}</span>
                    <span className="text-[8px] uppercase font-black text-primary/60 tracking-widest">{t("profile.labels.longestStreak" as any)}</span>
                  </div>
                </div>
              )}
              
              <div className="w-full mt-10 space-y-5 text-start">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Mail className="h-5 w-5" /></div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">{t("profile.labels.email" as any)}</span>
                    <span className="font-bold truncate text-sm md:text-base">{user.email}</span>
                  </div>
                </div>

                {user.phoneNumber && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Phone className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">{t("profile.labels.phone" as any)}</span>
                      <span className="font-bold text-sm md:text-base">{user.phoneNumber}</span>
                    </div>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Building2 className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">{t("profile.labels.department" as any)}</span>
                      <span className="font-bold text-sm md:text-base">{user.department.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Clock className="h-5 w-5" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">{t("profile.labels.memberSince" as any)}</span>
                    <span className="font-bold text-sm md:text-base">{new Date(user.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isTeacher && user.teacherChannel && (
            <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                        <Tv className="h-5 w-5" />
                    </div>
                    <h4 className="text-xl md:text-2xl font-black tracking-tight">{t("teacherChannel.labels.stats" as any)}</h4>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm md:text-base font-bold text-muted-foreground">{t("teacherChannel.labels.views" as any)}</span>
                        <span className="text-lg md:text-xl font-black">{user.teacherChannel.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm md:text-base font-bold text-muted-foreground">{t("teacherChannel.labels.conversion" as any)}</span>
                        <span className="text-lg md:text-xl font-black text-primary">{(user.teacherChannel.conversionRate * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </Card>
          )}
        </div>

        {/* Right Column: Details & Bio */}
        <div className="lg:col-span-8 space-y-10 md:space-y-16">
          {isTeacher && user.teacherChannel ? (
            <div className="space-y-10 md:space-y-16">
                {/* Hero Trailer Section */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-black overflow-hidden relative aspect-video group">
                    <AnimatePresence>
                        {isPreviewHovered && user.teacherChannel.trailerVideoUrl ? (
                            <motion.video 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                src={user.teacherChannel.trailerVideoUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <motion.img 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                src={user.teacherChannel.thumbnailUrl || user.image || ""}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent p-6 md:p-10 flex flex-col justify-end gap-4">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="space-y-2"
                        >
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl text-balance">
                                {user.teacherChannel.headline}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4">
                                <Badge className="bg-primary text-white border-none rounded-full px-4 py-1.5 font-black uppercase tracking-widest text-[10px] shadow-sm">
                                    {t("teacherChannel.labels.officialChannel" as any)}
                                </Badge>
                                {user.teacherChannel.trailerVideoUrl && (
                                    <Button 
                                        variant="ghost" 
                                        className="text-white hover:bg-white/10 gap-2 font-black uppercase tracking-widest text-[10px] rounded-full px-4 py-1.5"
                                        onMouseEnter={() => setIsPreviewHovered(true)}
                                        onMouseLeave={() => setIsPreviewHovered(false)}
                                        onTouchStart={() => setIsPreviewHovered(true)}
                                        onTouchEnd={() => setIsPreviewHovered(false)}
                                    >
                                        <Tv className="h-4 w-4" />
                                        {t("teacherChannel.labels.trailer" as any)}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </Card>

                {/* Channel Bio */}
                <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden">
                    <CardHeader className="p-8 md:p-10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                                <FileText className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl md:text-2xl font-black tracking-tight">{t("teacherChannel.labels.bio" as any)}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10 pt-4">
                        <p className="text-base md:text-lg leading-relaxed text-foreground/80 font-medium whitespace-pre-wrap italic">
                            "{user.teacherChannel.bio}"
                        </p>
                    </CardContent>
                </Card>

                {/* Available Classes Section */}
                <div className="space-y-6 md:space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight">{t("dashboard.stats.activeClasses" as any)}</h2>
                        </div>
                        <Badge variant="outline" className="rounded-full border-primary/20 font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest shadow-sm">
                            {t("teacherChannel.labels.activeModules" as any, { count: teacherClasses?.length || 0 })}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        {teacherClasses?.map((classItem) => (
                            <Card key={classItem.id} className="border-border/40 bg-card/50 backdrop-blur-3xl rounded-4xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all group shadow-sm">
                                <div className="aspect-video relative overflow-hidden">
                                    <img 
                                        src={classItem.bannerUrl || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1000"} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        alt={classItem.name}
                                    />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <Badge className="absolute top-4 right-4 bg-white/90 text-black border-none font-black text-[9px] uppercase tracking-widest shadow-sm">
                                        {classItem.subject?.name}
                                    </Badge>
                                </div>
                                <CardContent className="p-6 md:p-8 space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="text-xl md:text-2xl font-black tracking-tight group-hover:text-primary transition-colors truncate leading-tight">{classItem.name}</h4>
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm font-bold">
                                            <Users className="h-3.5 w-3.5" />
                                            {classItem.enrollments?.length || 0} / {classItem.capacity} {t("classes.list.studentsLabel" as any)}
                                        </div>
                                    </div>
                                    <Button asChild className="w-full h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/10">
                                        <Link to={`/classes/show/${classItem.id}`}>
                                            {t("buttons.joinClass" as any)}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
          ) : (
            <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden">
                <CardHeader className="p-8 md:p-10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                        <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-black tracking-tight">{t("profile.labels.bio" as any)}</CardTitle>
                </div>
                </CardHeader>
                <CardContent className="p-8 md:p-10 pt-4 space-y-8">
                <div className="space-y-4">
                    <p className="text-base md:text-lg leading-relaxed text-foreground/80 font-medium whitespace-pre-wrap">
                    {user.bio || t("profile.placeholders.noBio" as any)}
                    </p>
                </div>

                {user.address && (
                    <div className="pt-6 border-t border-border/40">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("profile.labels.address" as any)}</h4>
                    </div>
                    <p className={cn("text-sm md:text-base font-bold text-foreground/80", isAr ? "mr-6" : "ml-6")}>{user.address}</p>
                    </div>
                )}
                </CardContent>
            </Card>
          )}

          {isStudent && (
            <>
              {/* Report Card Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden">
                    <CardHeader className="p-8 md:p-10 pb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-xl md:text-2xl font-black tracking-tight">{t("profile.sections.report" as any)}</CardTitle>
                            </div>
                            <Badge className="bg-primary/10 text-primary border border-primary/20 font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest shadow-sm">
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
                                    <p className="font-black uppercase tracking-widest text-xs text-muted-foreground">{t("profile.privacy.note" as any)}</p>
                                    <p className="text-sm text-muted-foreground/60 font-medium">{t("profile.privacy.reportHidden" as any)}</p>
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
                <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden">
                    <CardHeader className="p-8 md:p-10 pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shadow-sm border border-amber-500/20">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl md:text-2xl font-black tracking-tight">{t("profile.sections.achievements" as any)}</CardTitle>
                        </div>
                        <Badge variant="outline" className="rounded-full border-primary/20 font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest shadow-sm">
                            {t("profile.labels.earned" as any, { 
                                count: displayBadges.filter(b => b.unlocked).length,
                                total: displayBadges.length,
                                defaultValue: `${displayBadges.filter(b => b.unlocked).length} / ${displayBadges.length} Earned`
                            })}
                        </Badge>
                    </div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
                <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden">
                    <CardHeader className="p-8 md:p-10 pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                                <Award className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl md:text-2xl font-black tracking-tight">{t("profile.sections.certificates" as any)}</CardTitle>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10">
                    <CertificateGallery studentName={user.name} isOwner={isSelf} />
                    </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {(isSelf || isAdmin) && (
            <div className="pt-6 flex justify-center">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-primary/5 px-6 py-2 rounded-full shadow-sm">
                <Shield className={cn("w-3 h-3", isAr ? "ml-2" : "mr-2")} />
                {t("profile.privacy.adminOnly" as any)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserShow;
