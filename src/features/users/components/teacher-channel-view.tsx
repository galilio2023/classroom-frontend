import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Tv, FileText, GraduationCap, Users, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { User, Class } from "@/types";

interface Props {
  user: User;
  teacherClasses: Class[];
}

export const TeacherChannelView = ({ user, teacherClasses }: Props) => {
  const { t } = useTranslation();
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);

  if (!user.teacherChannel) return null;

  return (
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
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent p-6 md:p-10 flex flex-col justify-end gap-4 text-start">
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
      <Card className="border-border/40 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden text-start">
        <CardHeader className="p-8 md:p-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-black tracking-tight">
              {t("teacherChannel.labels.bio" as any)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-10 pt-4">
          <p className="text-base md:text-lg leading-relaxed text-foreground/80 font-medium whitespace-pre-wrap italic">
            "{user.teacherChannel.bio}"
          </p>
        </CardContent>
      </Card>

      {/* Available Classes Section */}
      <div className="space-y-6 md:space-y-8 text-start">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              {t("dashboard.stats.activeClasses" as any)}
            </h2>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-primary/20 font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest shadow-sm"
          >
            {t("teacherChannel.labels.activeModules" as any, {
              count: teacherClasses.length,
            })}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {teacherClasses.map((classItem) => (
            <Card
              key={classItem.id}
              className="border-border/40 bg-card/50 backdrop-blur-3xl rounded-4xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all group shadow-sm"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={
                    classItem.bannerUrl ||
                    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1000"
                  }
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={classItem.name}
                />
                <div className="absolute inset-0 bg-black/20" />
                <Badge className="absolute top-4 end-4 bg-white/90 text-black border-none font-black text-[9px] uppercase tracking-widest shadow-sm">
                  {(classItem as any).subject?.name}
                </Badge>
              </div>
              <CardContent className="p-6 md:p-8 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xl md:text-2xl font-black tracking-tight group-hover:text-primary transition-colors truncate leading-tight">
                    {classItem.name}
                  </h4>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm font-bold">
                    <Users className="h-3.5 w-3.5" />
                    {(classItem as any).enrollments?.length || 0} /{" "}
                    {classItem.capacity}{" "}
                    {t("classes.list.studentsLabel" as any)}
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/10"
                >
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
  );
};
