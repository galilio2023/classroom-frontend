import { Class } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Info,
  BookOpen,
  ShieldCheck,
  Users,
  Building2,
  Megaphone,
  Copy,
  Check,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { TeacherNotes } from "./teacher-notes";
import { cn } from "@/lib/utils";
import { CanAccess } from "@/components/auth/can-access";

interface DetailsTabProps {
  aClass: Class;
  isOwner: boolean;
  isStaff: boolean;
  teacherNotes: string;
  isLoadingNotes: boolean;
  handleNoteChange: (val: string) => void;
  handleCopyInviteCode: () => void;
  copied: boolean;
  onInviteClick: () => void;
}

export const DetailsTab = ({
  aClass,
  isOwner,
  isStaff,
  teacherNotes,
  isLoadingNotes,
  handleNoteChange,
  handleCopyInviteCode,
  copied,
  onInviteClick,
}: DetailsTabProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const classColor = aClass.color || "#3b82f6";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 text-start">
      <div className="lg:col-span-2 space-y-6 md:space-y-10">
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-3xl rounded-4xl md:rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-6 md:p-10 pb-4 md:pb-6 border-b border-border/40">
            <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                <Info className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              {t("classes.show.details.classInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("classes.show.details.subjectArea")}
                </Label>
                <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-muted/30 flex items-center gap-3 md:gap-4 border border-border/40 shadow-inner">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <span className="font-black text-sm md:text-base text-foreground">
                    {aClass?.subject?.name ?? "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("classes.show.details.classStatus")}
                </Label>
                <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-muted/30 flex items-center gap-3 md:gap-4 border border-border/40 shadow-inner">
                  <div className="p-2 rounded-xl bg-green-500/10 text-green-600 shrink-0">
                    <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <Badge
                    variant="default"
                    className="capitalize font-black text-[9px] md:text-[10px] tracking-widest border-none px-3 py-1 md:px-4 rounded-lg shadow-sm"
                    style={{ backgroundColor: classColor }}
                  >
                    {aClass.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("classes.show.details.studentCapacity")}
                </Label>
                <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-muted/30 flex items-center gap-3 md:gap-4 border border-border/40 shadow-inner">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <span className="font-black text-sm md:text-base text-foreground">
                    {t("classes.show.details.capacityMax", {
                      count: aClass.capacity,
                    })}
                  </span>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("classes.show.details.department")}
                </Label>
                <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-muted/30 flex items-center gap-3 md:gap-4 border border-border/40 shadow-inner">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Building2 className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <span className="font-black text-sm md:text-base text-foreground">
                    {aClass.subject?.department?.name ||
                      t("classes.show.banner.academic")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isStaff && (
          <TeacherNotes
            teacherNotes={teacherNotes}
            handleNoteChange={handleNoteChange}
            isLoadingNotes={isLoadingNotes}
          />
        )}
      </div>

      <div className="space-y-6 md:space-y-10">
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-3xl rounded-4xl md:rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-6 md:p-10 pb-4 md:pb-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                <Megaphone className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              {t("classes.show.details.accessControl")}
            </CardTitle>
            
            <CanAccess resource="classes" action="edit" id={aClass.id}>
                {isOwner && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto h-10 md:h-12 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] border-primary/20 text-primary hover:bg-primary/5 px-6 shadow-sm"
                    onClick={onInviteClick}
                >
                    <UserPlus className={cn("h-4 w-4", "me-2")} />
                    {t("buttons.invite")}
                </Button>
                )}
            </CanAccess>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10">
            {isStaff && (
              <div
                className="flex flex-col items-center justify-center p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] border-[3px] md:border-4 border-dashed transition-all group hover:bg-primary/2 text-center space-y-4 md:space-y-6 shadow-sm"
                style={{
                  backgroundColor: `${classColor}05`,
                  borderColor: `${classColor}20`,
                }}
              >
                <div className="space-y-1">
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80"
                    style={{ color: classColor }}
                  >
                    {t("classes.show.details.inviteCode")}
                  </p>
                  <p className="text-4xl md:text-5xl font-black font-mono tracking-[0.3em] ms-[0.3em]">
                    {aClass.inviteCode}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-border/40 bg-white dark:bg-muted/10 shadow-xl group-hover:scale-105 transition-transform font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 gap-2"
                  onClick={handleCopyInviteCode}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-success" />
                      {t("buttons.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      {t("buttons.copyCode")}
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="space-y-4 md:space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                {t("classes.show.details.teachingStaff")}
              </Label>
              <div className="grid gap-3 md:gap-4">
                {aClass.teachers?.map((tc) => (
                  <div
                    key={tc.teacher.id}
                    className="flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-[1.25rem] md:rounded-3xl bg-muted/30 border border-border/40 hover:border-primary/20 transition-all group shadow-sm"
                  >
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 md:border-4 border-background shadow-lg group-hover:scale-110 transition-transform rounded-xl md:rounded-2xl">
                      {tc.teacher.image && (
                        <AvatarImage
                          src={tc.teacher.image}
                          alt={tc.teacher.name}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-xs md:text-sm">
                        {tc.teacher.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-start min-w-0">
                      <p className="text-sm md:text-base font-black tracking-tight truncate">
                        {tc.teacher.name}
                      </p>
                      <p className="text-[9px] md:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                        {tc.isPrimary
                          ? t("classes.show.details.primaryInstructor")
                          : t("classes.show.details.coInstructor")}
                      </p>
                    </div>
                    {tc.isPrimary && (
                      <Badge
                        variant="secondary"
                        className="text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg shrink-0"
                      >
                        {t("classes.show.details.lead")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
