import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Presentation, ListChecks, Users, BrainCircuit } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RoadmapDisplayProps {
  roadmap: any;
  isCourseRoadmap?: boolean;
}

export const RoadmapDisplay = React.memo(({ roadmap, isCourseRoadmap }: RoadmapDisplayProps) => {
  const { t } = useTranslation();

  if (!roadmap?.sessionTitle && !roadmap?.title) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
        <div className="p-6 bg-muted rounded-full">
          <BrainCircuit className="h-12 w-12" />
        </div>
        <div className="space-y-1">
          <h3 className="font-black uppercase tracking-widest text-xs">
            {isCourseRoadmap ? "No Course Roadmap" : "No Roadmap Generated"}
          </h3>
          <p className="text-sm font-medium">
            {isCourseRoadmap
              ? "Teacher hasn't published the course roadmap yet."
              : "Teacher can enable AI Roadmap when starting the session."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-xl border-border/40 border rounded-4xl p-8 md:p-10 space-y-8 h-150 overflow-y-auto custom-scrollbar text-start">
      <div className="space-y-10">
        <div className="space-y-2">
          <Badge className="bg-ai-primary/10 text-ai-primary border-ai-primary/20 font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full mb-2">
            {isCourseRoadmap
              ? t("classes.roadmap.courseTitle", "Course Journey")
              : t("classes.live.roadmap.sessionTitle", "Session Title")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            {roadmap.sessionTitle || roadmap.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black tracking-tight">
                {isCourseRoadmap
                  ? t("classes.roadmap.vision", "Course Vision")
                  : t("classes.live.roadmap.icebreaker", "Icebreaker")}
              </h3>
            </div>
            <p className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-orange-700/80 font-medium italic italic-leading-relaxed text-balance">
              "{roadmap.icebreaker || roadmap.vision}"
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Presentation className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black tracking-tight">
                {isCourseRoadmap
                  ? t("classes.roadmap.coreCompetencies", "Core Competencies")
                  : t("classes.live.roadmap.keyConcepts", "Key Concepts")}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(roadmap.keyConcepts || roadmap.competencies)?.map(
                (concept: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-full px-4 py-2 border-primary/20 bg-primary/5 font-bold text-xs"
                  >
                    {concept}
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
              <ListChecks className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              {isCourseRoadmap
                ? t("classes.roadmap.milestones", "Course Milestones")
                : t("classes.live.roadmap.outline", "Lesson Outline")}
            </h3>
          </div>
          <div className="space-y-4">
            {(roadmap.outline || roadmap.milestones)?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-6 p-6 rounded-2xl bg-muted/30 border border-border/20 group hover:border-primary/30 transition-all"
              >
                <div className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-lg shrink-0">
                  {item.time || item.week || item.phase}
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-lg group-hover:text-primary transition-colors">
                    {item.topic || item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {item.goal || item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-destructive/5 border-2 border-dashed border-destructive/20 space-y-3">
          <h4 className="font-black uppercase tracking-widest text-[10px] text-destructive flex items-center gap-2">
            <Users className="h-3 w-3" />
            {isCourseRoadmap
              ? t("classes.roadmap.prerequisites", "Prerequisites & Expectations")
              : t("classes.live.roadmap.watchouts", "Student Watch-outs")}
          </h4>
          <p className="text-sm font-bold text-destructive/80 leading-relaxed text-balance">
            {roadmap.studentWatchouts || roadmap.expectations}
          </p>
        </div>
      </div>
    </div>
  );
});
