import { 
  useGetIdentity, 
  useCustom, 
  useCustomMutation,
  useInvalidate
} from "@refinedev/core";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Tv, 
  Video, 
  Image as ImageIcon, 
  Save, 
  Eye, 
  BarChart3,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileUpload } from "@/components/file-upload";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, TeacherChannel } from "@/types";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  usePageTitle(t("teacherChannel.title"));
  const { data: identity } = useGetIdentity<User>();
  const invalidate = useInvalidate();
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);

  const { query } = useCustom<TeacherChannel>({
    url: `/channels/teacher/${identity?.id}`,
    method: "get",
    queryOptions: {
      enabled: !!identity?.id,
      retry: false
    }
  });

  const channelData = query.data;
  const isLoading = query.isLoading;

  const { mutate: upsertChannel, mutation: upsertMutation } = useCustomMutation();

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
    upsertChannel({
      url: "/channels",
      method: "post",
      values,
    }, {
      onSuccess: () => {
        toast.success(t("teacherChannel.toasts.success"));
        invalidate({ resource: "teacher-channel", invalidates: ["list", "detail"] });
      },
      onError: () => {
        toast.error(t("teacherChannel.toasts.error"));
      }
    });
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
            <p className="text-xs font-medium text-muted-foreground/60 italic">Preparing your broadcasting studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-16 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2"
      >
        <div className="space-y-4 md:space-y-6 flex-1 text-start">
          <Breadcrumb />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                <Tv className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
                <h1 className="page-title mb-0">{t("teacherChannel.title")}</h1>
                <p className="text-muted-foreground font-medium max-w-xl text-balance">
                    {t("teacherChannel.description")}
                </p>
            </div>
          </div>
        </div>
        
        {channelData?.data && (
          <div className="flex items-center gap-6 bg-card/50 backdrop-blur-3xl p-6 rounded-[2rem] border border-border/40 shadow-xl shadow-black/5 min-w-[280px]">
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
                {t("teacherChannel.labels.views")}
              </p>
              <p className="text-2xl font-black tracking-tighter">{channelData.data.totalViews.toLocaleString()}</p>
            </div>
            <div className="h-12 w-px bg-border/40" />
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
                {t("teacherChannel.labels.conversion")}
              </p>
              <p className="text-2xl font-black text-primary tracking-tighter">
                {(channelData.data.conversionRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
        {/* Configuration Form */}
        <div className="lg:col-span-7 space-y-8 md:space-y-12">
          <Card className="rounded-[2.5rem] md:rounded-[3rem] border-border/40 shadow-2xl bg-card/50 backdrop-blur-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/40 p-8 md:p-10 text-start">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl md:text-2xl font-black tracking-tight">
                    {t("teacherChannel.setup")}
                  </CardTitle>
                  <CardDescription className="font-medium text-sm md:text-base">
                    {t("teacherChannel.setupDesc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <form onSubmit={handleSubmit(onFinish)} className="space-y-10">
                <div className="space-y-4 text-start">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                    {t("teacherChannel.labels.headline")}
                  </Label>
                  <Input 
                    {...register("headline")}
                    placeholder={t("teacherChannel.placeholders.headline")}
                    className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 text-lg md:text-xl font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                  />
                  {errors.headline && (
                    <p className="text-xs text-destructive font-black flex items-center gap-2 ml-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.headline.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4 text-start">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                    {t("teacherChannel.labels.bio")}
                  </Label>
                  <Textarea 
                    {...register("bio")}
                    placeholder={t("teacherChannel.placeholders.bio")}
                    className="min-h-48 md:min-h-60 rounded-[2rem] md:rounded-[2.5rem] bg-muted/30 border-none shadow-inner text-base md:text-lg font-medium p-8 md:p-10 resize-none focus-visible:ring-primary/20 leading-relaxed italic"
                  />
                  {errors.bio && (
                    <p className="text-xs text-destructive font-black flex items-center gap-2 ml-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.bio.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                  <div className="space-y-4 text-start">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                      {t("teacherChannel.labels.trailer")}
                    </Label>
                    <div className="p-1 rounded-[2rem] bg-muted/30 shadow-inner">
                        <FileUpload 
                        folder="trailers"
                        accept="video/mp4,video/quicktime"
                        maxSize={100 * 1024 * 1024}
                        label={t("upload.video.label" as any)}
                        onUploadSuccess={(url, publicId) => {
                            setValue("trailerVideoUrl", url, { shouldDirty: true });
                            setValue("trailerVideoCldPubId", publicId, { shouldDirty: true });
                        }}
                        />
                    </div>
                    {watchedValues.trailerVideoUrl && (
                      <div className="flex items-center gap-2 mt-2 px-2">
                        <Badge variant="success" className="rounded-full px-3 py-1 font-black uppercase tracking-widest text-[9px] shadow-sm">
                          {t("status.active")}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground">Trailer Linked</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-start">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                      {t("teacherChannel.labels.thumbnail")}
                    </Label>
                    <div className="p-1 rounded-[2rem] bg-muted/30 shadow-inner">
                        <FileUpload 
                        folder="thumbnails"
                        accept="image/*"
                        onUploadSuccess={(url, publicId) => {
                            setValue("thumbnailUrl", url, { shouldDirty: true });
                            setValue("thumbnailCldPubId", publicId, { shouldDirty: true });
                        }}
                        />
                    </div>
                    {watchedValues.thumbnailUrl && (
                      <div className="flex items-center gap-2 mt-2 px-2">
                        <Badge variant="success" className="rounded-full px-3 py-1 font-black uppercase tracking-widest text-[9px] shadow-sm">
                          {t("status.active")}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground">Thumbnail Linked</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-border/40">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={upsertMutation.isPending || (!isDirty && !!channelData?.data)}
                    className="h-16 w-full md:w-auto px-12 rounded-[1.25rem] font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 group"
                  >
                    {upsertMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    ) : (
                      <Save className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                    )}
                    {channelData?.data ? t("buttons.saveChanges") : t("buttons.createChannel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-5 space-y-8 md:space-y-12">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                    <Eye className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  {t("teacherChannel.labels.preview")}
                </span>
              </div>
              <Badge variant="destructive" className="rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-destructive/20 animate-pulse border-none">
                {t("teacherChannel.labels.livePreview")}
              </Badge>
            </div>

            <motion.div
              initial={false}
              onMouseEnter={() => setIsPreviewHovered(true)}
              onMouseLeave={() => setIsPreviewHovered(false)}
              onTouchStart={() => setIsPreviewHovered(true)}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-border/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] group bg-black"
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
                    src={watchedValues.thumbnailUrl || identity?.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                    alt="Preview"
                  />
                )}
              </AnimatePresence>

              {/* Overlay Polish */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight text-start">
                    {watchedValues.headline || identity?.name || "Teacher Name"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="ai" className="bg-primary text-white border-none rounded-full px-4 py-1 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20">
                      {t("roles.teacher")}
                    </Badge>
                    <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-widest">
                      <BarChart3 className="h-4 w-4" />
                      {channelData?.data?.totalViews.toLocaleString() || 0} {t("teacherChannel.labels.views")}
                    </div>
                  </div>
                </div>

                <p className="text-base md:text-lg font-medium text-white/80 line-clamp-3 leading-relaxed text-start italic selection:bg-primary/30">
                  "{watchedValues.bio || "Your channel biography will appear here. Students use this to decide if they want to join your classes."}"
                </p>

                <Button className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl shadow-black/40 text-[10px] gap-3">
                  {t("buttons.viewClasses")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-8 rounded-[2.5rem] bg-indigo-500/[0.03] border-2 border-dashed border-indigo-500/20 backdrop-blur-sm text-start"
            >
              <div className="flex gap-5 items-start">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 shadow-sm">
                    <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm md:text-base font-medium text-muted-foreground/80 leading-relaxed">
                  Hover or tap the card to see how your trailer auto-plays. A high-quality trailer can boost classroom discovery by <span className="text-primary font-black">40%</span>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherChannelPage;
