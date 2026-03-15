import { Class } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info, BookOpen, ShieldCheck, Users, Building2, Megaphone, Copy, Check, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TeacherNotes } from "./teacher-notes";

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
  const { t } = useTranslation();
  const classColor = aClass.color || "#3b82f6";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-start">
      <div className="lg:col-span-2 space-y-10">
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-black/[0.03] dark:border-white/[0.03]">
            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Info className="h-6 w-6" />
              </div>
              {t("classes.show.details.classInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t("classes.show.details.subjectArea")}
                </Label>
                <div className="p-5 rounded-[1.5rem] bg-muted/30 flex items-center gap-4 border border-primary/5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="font-black text-base">
                    {aClass?.subject?.name ?? "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t("classes.show.details.classStatus")}
                </Label>
                <div className="p-5 rounded-[1.5rem] bg-muted/30 flex items-center gap-4 border border-primary/5">
                  <div className="p-2 rounded-xl bg-green-500/10 text-green-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="default"
                    className="capitalize font-black text-[10px] uppercase tracking-widest border-none px-4 py-1 rounded-lg"
                    style={{ backgroundColor: classColor }}
                  >
                    {aClass.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t("classes.show.details.studentCapacity")}
                </Label>
                <div className="p-5 rounded-[1.5rem] bg-muted/30 flex items-center gap-4 border border-primary/5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="font-black text-base">
                    {t("classes.show.details.capacityMax", {
                      count: aClass.capacity,
                    })}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t("classes.show.details.department")}
                </Label>
                <div className="p-5 rounded-[1.5rem] bg-muted/30 flex items-center gap-4 border border-primary/5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="font-black text-base">
                    {aClass.subject?.department?.name ||
                      t("classes.show.banner.academic")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <TeacherNotes
          teacherNotes={teacherNotes}
          handleNoteChange={handleNoteChange}
          isLoadingNotes={isLoadingNotes}
        />
      </div>

      <div className="space-y-10">
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-black/[0.03] dark:border-white/[0.03]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Megaphone className="h-8 w-8" />
                </div>
                {t("classes.show.details.accessControl")}
              </CardTitle>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-primary/10 text-primary hover:bg-primary/5 px-4"
                  onClick={onInviteClick}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("buttons.invite")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            {isStaff && (
              <div
                className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] border-4 border-dashed transition-all group hover:bg-primary/[0.02] text-center space-y-4"
                style={{
                  backgroundColor: `${classColor}05`,
                  borderColor: `${classColor}20`,
                }}
              >
                <div className="space-y-1">
                  <p
                    className="text-[10px] font-black uppercase tracking-widest opacity-60"
                    style={{ color: classColor }}
                  >
                    {t("classes.show.details.inviteCode")}
                  </p>
                  <p className="text-5xl font-black font-mono tracking-[0.3em] ml-[0.3em]">
                    {aClass.inviteCode}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-none bg-white dark:bg-zinc-900 shadow-xl group-hover:scale-105 transition-transform font-black uppercase tracking-widest text-[10px] h-12 px-8 gap-2"
                  onClick={handleCopyInviteCode}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-success" />
                      {t("buttons.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-primary" />
                      {t("buttons.copyCode")}
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                {t("classes.show.details.teachingStaff")}
              </Label>
              <div className="grid gap-4">
                {aClass.teachers?.map((tc) => (
                  <div
                    key={tc.teacher.id}
                    className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-muted/30 border border-transparent hover:border-primary/10 transition-all group"
                  >
                    <Avatar className="h-12 w-12 border-4 border-background shadow-lg group-hover:scale-110 transition-transform rounded-2xl">
                      {tc.teacher.image && (
                        <AvatarImage
                          src={tc.teacher.image}
                          alt={tc.teacher.name}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-primary/5 text-primary font-black">
                        {tc.teacher.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-start">
                      <p className="text-base font-black tracking-tight">
                        {tc.teacher.name}
                      </p>
                      <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        {tc.isPrimary
                          ? t("classes.show.details.primaryInstructor")
                          : t("classes.show.details.coInstructor")}
                      </p>
                    </div>
                    {tc.isPrimary && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none px-3 py-1 rounded-lg"
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
