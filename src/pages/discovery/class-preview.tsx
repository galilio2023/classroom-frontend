import React from "react";
import { useOne } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
  Users,
  CircleDollarSign,
  GraduationCap,
  Calendar,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Class } from "@/types";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useTelemetry } from "@/hooks/use-telemetry";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Big from "big.js";

export const PublicClassPreview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useTelemetry();

  const { query } = useOne<Class>({
    resource: "public-classes",
    id: id || "",
  });

  const { data, isLoading, isError } = query;
  const aClass = data?.data;

  useEffect(() => {
    if (aClass?.id) {
      trackEvent(aClass.id, "view");
    }
  }, [aClass?.id]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Opening Classroom Preview...
        </p>
      </div>
    );
  }

  if (isError || !aClass) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center gap-6">
        <div className="p-8 rounded-full bg-destructive/10 text-destructive">
          <Lock className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Class Not Found</h2>
        <Button onClick={() => navigate("/discovery/classes")}>Return to Catalog</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 text-start">
      <Helmet>
        <title>
          {aClass.name} | {aClass.subject?.name || "Class"} Preview
        </title>
        <meta
          name="description"
          content={aClass.description || `Explore ${aClass.name} on Tablawy OS.`}
        />
        <meta property="og:title" content={`${aClass.name} - Public Preview`} />
        <meta
          property="og:description"
          content={aClass.description || `Join this classroom led by expert educators.`}
        />
        <meta property="og:image" content={aClass.bannerUrl || ""} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Banner & Hero */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden rounded-b-[4rem] md:rounded-b-[6rem] shadow-2xl">
        <img
          src={
            aClass.bannerUrl ||
            "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000"
          }
          className="w-full h-full object-cover"
          alt={aClass.name}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

        <div className="absolute inset-0 container-center flex flex-col justify-end pb-12 md:pb-20 space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-fit text-white hover:bg-white/20 gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Button>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-white text-primary border-none font-black px-4 py-1 rounded-full uppercase text-[10px]">
                {aClass.subject?.name}
              </Badge>
              {aClass.isPaid && (
                <Badge className="bg-primary text-white border-none font-black px-4 py-1 rounded-full uppercase text-[10px]">
                  Premium Course
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
              {aClass.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="container-center mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight">About this Class</h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
              {aClass.description}
            </p>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase tracking-tight">Curriculum Preview</h2>
              <Badge
                variant="outline"
                className="px-4 py-1 rounded-full font-black uppercase text-[10px]"
              >
                {aClass.modules?.length || 0} Modules
              </Badge>
            </div>

            <div className="space-y-6">
              {aClass.modules?.map((module, idx) => (
                <Card
                  key={module.id}
                  className="border-none shadow-xl rounded-3xl overflow-hidden group"
                >
                  <CardHeader className="bg-muted/30 p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          Module {idx + 1}
                        </div>
                        <CardTitle className="text-2xl font-black">{module.name}</CardTitle>
                      </div>
                      <div className="p-3 rounded-2xl bg-background border shadow-sm group-hover:scale-110 transition-transform">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        {module.resources?.length || 0} Lessons
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {module.assignments?.length || 0} Projects
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        {module.quizzes?.length || 0} AI Quizzes
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Enrollment / CTA */}
        <div className="space-y-8">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden sticky top-24">
            <div className="h-3 bg-primary w-full" />
            <CardHeader className="p-10 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Enrollment Fee
                </p>
                <div className="flex items-center justify-center gap-2">
                  <CircleDollarSign className="h-8 w-8 text-primary" />
                  <span className="text-5xl font-black tracking-tighter">
                    {aClass.isPaid ? new Big(aClass.priceAmount || 0).toFixed(2) : "FREE"}
                  </span>
                  {aClass.isPaid && (
                    <span className="text-xl font-black opacity-40 uppercase">
                      {aClass.currency}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => {
                    if (aClass?.id) trackEvent(aClass.id, "preview_click");
                    navigate("/login");
                  }}
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  Join this Class
                </Button>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                  Log in or create an account to start learning.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-0 border-t bg-muted/10 space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Instructor
                </h4>
                {aClass.teachers?.map((t) => (
                  <div key={t.teacher.id} className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarImage src={t.teacher.image || undefined} />
                      <AvatarFallback className="font-black">{t.teacher.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-black uppercase tracking-tight">
                        {t.teacher.name}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground line-clamp-1">
                        Expert Educator
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicClassPreview;
