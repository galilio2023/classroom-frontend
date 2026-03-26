import { Link } from "react-router-dom";
import {
  User as UserIcon,
  Loader2,
  Share2,
  XCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { useTranslation } from "react-i18next";
import { useUserProfile } from "../hooks/use-user-profile";
import { ProfileCard } from "../components/profile-card";
import { TeacherChannelView } from "../components/teacher-channel-view";
import { StudentPerformanceView } from "../components/student-performance-view";
import usePageTitle from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";

const UserShow = () => {
  const { t } = useTranslation();
  const {
    user,
    teacherClasses,
    displayBadges,
    isAr,
    isLoading,
    isError,
    isSelf,
    isAdmin,
    isStudent,
    isTeacher,
  } = useUserProfile();

  usePageTitle(user?.name ? `${user.name}'s Profile` : t("profile.title"));

  if (isLoading)
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
          <p className="text-xs font-medium text-muted-foreground/60 italic">
            Fetching user details and achievements...
          </p>
        </div>
      </div>
    );

  if (isError || !user)
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-balance">
                {t("profile.title" as any)}
              </h1>
              <p className="text-muted-foreground font-medium max-w-xl text-balance">
                {t("profile.description" as any)}
              </p>
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
              <Share2 className="w-4 h-4" /> {t("buttons.shareProfile" as any)}
            </Button>
            {(isSelf || isAdmin) && (
              <Button
                size="lg"
                className="w-full md:w-auto rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 shadow-lg shadow-primary/25"
                asChild
              >
                <Link to={`/users/edit/${user.id}`}>
                  {t("buttons.editProfile" as any)}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-10 md:gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ProfileCard
            user={user}
            isStudent={isStudent}
            isTeacher={isTeacher}
          />
        </div>
        <div className="lg:col-span-8 space-y-10 md:space-y-16">
          {isTeacher ? (
            <TeacherChannelView user={user} teacherClasses={teacherClasses} />
          ) : isStudent ? (
            <StudentPerformanceView
              user={user}
              displayBadges={displayBadges}
              isSelf={isSelf}
              isAdmin={isAdmin}
            />
          ) : null}
          {isAdmin && (
            <div className="pt-6 flex justify-center">
              <Badge
                variant="outline"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-primary/5 px-6 py-2 rounded-full shadow-sm"
              >
                <Shield className={cn("w-3 h-3", "me-2")} />
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
