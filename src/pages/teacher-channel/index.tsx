import React, { useEffect, useState } from "react";
import {
  useGetIdentity,
  useCustom,
  useCustomMutation,
  useInvalidate,
} from "@refinedev/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tv,
  Eye,
  BarChart3,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Radio,
  Video,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileUpload } from "@/components/file-upload";
import { toast } from "sonner";
import { User, TeacherChannel } from "@/types";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { cn } from "@/lib/utils";

const channelSchema = z.object({
  headline: z.string().min(5, "Headline must be at least 5 characters"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  trailerVideoUrl: z.string().url().optional().nullable(),
  trailerVideoCldPubId: z.string().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  thumbnailCldPubId: z.string().optional().nullable(),
});

type ChannelFormValues = z.infer<typeof channelSchema>;
const TeacherChannelPage = () => {
  const { t } = useTranslation();
  usePageTitle(t("teacherChannel.title" as any));
  const { data: identity } = useGetIdentity<User>();
  const invalidate = useInvalidate();
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);

  // Refine v5 useCustom returns an object containing 'query'
  const { query } = useCustom<TeacherChannel>({
    url: `/channels/teacher/${identity?.id}`,
    method: "get",
    queryOptions: {
      enabled: !!identity?.id,
      retry: false,
    },
  });

  const channelData = query.data;
  const isLoading = query.isPending;

  const { mutate: upsertChannel, mutation: upsertMutation } =
    useCustomMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      headline: "",
      bio: "",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (channelData?.data) {
      reset({
        headline: channelData.data.headline,
        bio: channelData.data.bio,
        trailerVideoUrl: channelData.data.trailerVideoUrl,
        trailerVideoCldPubId: channelData.data.trailerVideoCldPubId,
        thumbnailUrl: channelData.data.thumbnailUrl,
        thumbnailCldPubId: channelData.data.thumbnailCldPubId,
      });
    }
  }, [channelData, reset]);

  const onFinish = (values: ChannelFormValues) => {
    upsertChannel(
      {
        url: "/channels",
        method: "post",
        values,
      },
      {
        onSuccess: () => {
          toast.success(t("teacherChannel.toasts.success"));
          invalidate({
            resource: "teacher-channel",
            invalidates: ["list", "detail"],
          });
        },
        onError: () => {
          toast.error(t("teacherChannel.toasts.error"));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="absolute inset-[-20px] rounded-full bg-primary/5 animate-ping duration-[3000ms]" />
          <Loader2 className="h-20 w-20 animate-spin text-primary/10 stroke-[1]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Tv className="h-8 w-8 text-primary/30" />
          </div>
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
            {t("profile.loading")}
          </h2>
          <p className="text-xs font-medium text-muted-foreground/60 italic">
            Preparing your broadcasting studio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-center section-wrapper !pt-10">
      <div className="noise-overlay" />

      {/* Cinematic Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16 relative z-10"
      >
        <div className="space-y-6 flex-1 text-start">
          <Breadcrumb />
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative p-5 rounded-3xl bg-primary text-white shadow-2xl">
                <Radio className="h-8 w-8 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-gradient mb-2">
                Studio <span className="text-primary/40">Center</span>
              </h1>
              <p className="text-muted-foreground font-medium max-w-xl text-lg">
                Design your personal "Promotion Channel" to attract students and
                showcase your teaching style.
              </p>
            </div>
          </div>
        </div>

        {channelData?.data && (
          <div className="flex items-center gap-8 glass-card p-8 rounded-[2.5rem] min-w-[320px]">
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-2">
                Broadcast Views
              </p>
              <p className="text-3xl font-black tracking-tighter">
                {channelData.data.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="h-16 w-px bg-border/40" />
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-2">
                Conversion
              </p>
              <p className="text-3xl font-black text-primary tracking-tighter">
                {(channelData.data.conversionRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start relative z-10">
        {/* Configuration Form */}
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-12">
            <form onSubmit={handleSubmit(onFinish)} className="space-y-16">
              <div className="space-y-6 text-start">
                <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary ms-2">
                  Promotional Headline
                </Label>
                <Input
                  {...register("headline")}
                  placeholder="e.g. Master Modern Physics with AI"
                  className="h-20 rounded-4xl bg-muted/20 border-none shadow-inner px-10 text-xl md:text-3xl font-black placeholder:text-muted-foreground/20 focus-visible:ring-primary/20 transition-all"
                />
                {errors.headline && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-2 ms-4">
                    <AlertCircle className="h-4 w-4" />
                    {errors.headline.message}
                  </p>
                )}
              </div>

              <div className="space-y-6 text-start">
                <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary ms-2">
                  Channel Biography
                </Label>
                <Textarea
                  {...register("bio")}
                  placeholder="Tell your story. What makes your teaching unique?"
                  className="min-h-60 md:min-h-80 rounded-[3rem] bg-muted/20 border-none shadow-inner text-lg md:text-xl font-medium p-10 resize-none focus-visible:ring-primary/20 leading-relaxed italic"
                />
                {errors.bio && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-2 ms-4">
                    <AlertCircle className="h-4 w-4" />
                    {errors.bio.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-6 text-start">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary ms-2">
                    Video Trailer
                  </Label>
                  <div className="p-1 rounded-[2.5rem] bg-muted/20 shadow-inner group hover:bg-muted/30 transition-colors">
                    <FileUpload
                      folder="trailers"
                      accept="video/mp4,video/quicktime"
                      maxSize={100 * 1024 * 1024}
                      label="Upload Trailer"
                      onUploadSuccess={(url, publicId) => {
                        setValue("trailerVideoUrl", url, { shouldDirty: true });
                        setValue("trailerVideoCldPubId", publicId, {
                          shouldDirty: true,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-6 text-start">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary ms-2">
                    Cover Thumbnail
                  </Label>
                  <div className="p-1 rounded-[2.5rem] bg-muted/20 shadow-inner group hover:bg-muted/30 transition-colors">
                    <FileUpload
                      folder="thumbnails"
                      accept="image/*"
                      onUploadSuccess={(url, publicId) => {
                        setValue("thumbnailUrl", url, { shouldDirty: true });
                        setValue("thumbnailCldPubId", publicId, {
                          shouldDirty: true,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-border/40">
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    upsertMutation.isPending ||
                    (!isDirty && !!channelData?.data)
                  }
                  className="h-20 w-full md:w-auto px-16 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 group"
                >
                  {upsertMutation.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin me-4" />
                  ) : (
                    <Save className="h-6 w-6 me-4 group-hover:rotate-12 transition-transform" />
                  )}
                  {channelData?.data ? "Update Broadcast" : "Launch Channel"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-5 space-y-12">
          <div className="sticky top-32">
            <div className="flex items-center justify-between mb-8 px-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary text-white shadow-lg">
                  <Eye className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                  Netflix Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                  Live
                </span>
              </div>
            </div>

            <motion.div
              initial={false}
              onMouseEnter={() => setIsPreviewHovered(true)}
              onMouseLeave={() => setIsPreviewHovered(false)}
              className="relative aspect-[4/5.5] rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] group bg-black cursor-pointer"
            >
              <AnimatePresence mode="wait">
                {isPreviewHovered && watchedValues.trailerVideoUrl ? (
                  <motion.video
                    key="trailer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={watchedValues.trailerVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <motion.img
                    key="thumbnail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={
                      watchedValues.thumbnailUrl ||
                      identity?.image ||
                      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"
                    }
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    alt="Preview"
                  />
                )}
              </AnimatePresence>

              {/* Advanced Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-10 md:p-14 space-y-8">
                <div className="space-y-4">
                  <motion.div layout>
                    <Badge className="bg-primary/20 backdrop-blur-md text-primary-foreground border-primary/20 rounded-full px-5 py-1.5 font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                      Premier Educator
                    </Badge>
                  </motion.div>
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[0.9] text-start uppercase">
                    {watchedValues.headline ||
                      identity?.name ||
                      "Broadcasting..."}
                  </h3>
                </div>

                <p className="text-lg font-medium text-white/60 line-clamp-3 leading-relaxed text-start italic">
                  {watchedValues.bio ||
                    "Your channel biography will appear here. Students use this to decide if they want to join your classes."}
                </p>

                <div className="flex items-center gap-6 pt-4">
                  <Button className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 text-[11px] gap-3">
                    <Video className="h-4 w-4" />
                    Explore Classes
                  </Button>
                  <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 p-10 rounded-[3rem] bg-primary/3 border-2 border-dashed border-primary/20 backdrop-blur-sm text-start relative overflow-hidden"
            >
              <div className="absolute top-0 end-0 p-10 opacity-[0.05]">
                <Radio className="h-20 w-20" />
              </div>
              <div className="flex gap-6 items-start relative z-10">
                <div className="p-3 rounded-2xl bg-primary text-white shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black uppercase tracking-widest text-xs">
                    Studio Tip
                  </h4>
                  <p className="text-base font-medium text-muted-foreground/80 leading-relaxed">
                    High-quality video trailers increase conversion by{" "}
                    <span className="text-primary font-black">40%</span>. Hover
                    the preview card to see your video in action.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherChannelPage;
