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
  LayoutDashboard
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
  const isError = query.isError;

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
      <div className="container mx-auto py-10 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[600px] lg:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-10 text-start">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
                <Tv className="h-8 w-8 text-primary" />
            </div>
            {t("teacherChannel.title")}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t("teacherChannel.description")}
          </p>
        </div>
        
        {channelData?.data && (
          <div className="flex items-center gap-4 bg-card/50 p-4 rounded-2xl border border-primary/5 shadow-sm">
            <div className="text-end">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("teacherChannel.labels.views")}
              </p>
              <p className="text-xl font-black">{channelData.data.totalViews.toLocaleString()}</p>
            </div>
            <div className="h-10 w-px bg-primary/10" />
            <div className="text-end">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("teacherChannel.labels.conversion")}
              </p>
              <p className="text-xl font-black text-primary">
                {(channelData.data.conversionRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Configuration Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-primary/5 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/5 p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black tracking-tight">
                    {t("teacherChannel.setup")}
                  </CardTitle>
                  <CardDescription className="font-medium">
                    {t("teacherChannel.setupDesc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <form onSubmit={handleSubmit(onFinish)} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("teacherChannel.labels.headline")}
                  </Label>
                  <Input 
                    {...register("headline")}
                    placeholder={t("teacherChannel.placeholders.headline")}
                    className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30 text-lg font-bold px-6"
                  />
                  {errors.headline && (
                    <p className="text-xs text-destructive font-bold flex items-center gap-1 ml-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.headline.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("teacherChannel.labels.bio")}
                  </Label>
                  <Textarea 
                    {...register("bio")}
                    placeholder={t("teacherChannel.placeholders.bio")}
                    className="min-h-40 rounded-3xl bg-muted/30 border-none focus-visible:ring-primary/30 text-base font-medium p-6 resize-none"
                  />
                  {errors.bio && (
                    <p className="text-xs text-destructive font-bold flex items-center gap-1 ml-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.bio.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      {t("teacherChannel.labels.trailer")}
                    </Label>
                    <FileUpload 
                      folder="trailers"
                      accept="video/mp4,video/quicktime"
                      maxSize={100 * 1024 * 1024} // 100MB
                      label={t("upload.video.label")}
                      onUploadSuccess={(url, publicId) => {
                        setValue("trailerVideoUrl", url, { shouldDirty: true });
                        setValue("trailerVideoCldPubId", publicId, { shouldDirty: true });
                      }}
                    />
                    {watchedValues.trailerVideoUrl && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none rounded-lg px-3 py-1 font-black uppercase tracking-tighter text-[9px]">
                          Video Linked ✅
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      {t("teacherChannel.labels.thumbnail")}
                    </Label>
                    <FileUpload 
                      folder="thumbnails"
                      accept="image/*"
                      onUploadSuccess={(url, publicId) => {
                        setValue("thumbnailUrl", url, { shouldDirty: true });
                        setValue("thumbnailCldPubId", publicId, { shouldDirty: true });
                      }}
                    />
                    {watchedValues.thumbnailUrl && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none rounded-lg px-3 py-1 font-black uppercase tracking-tighter text-[9px]">
                          Thumbnail Linked ✅
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-primary/5">
                  <Button 
                    type="submit" 
                    disabled={upsertMutation.isPending || (!isDirty && !!channelData?.data)}
                    className="h-16 w-full md:w-auto px-12 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                  >
                    {upsertMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    {channelData?.data ? t("buttons.saveChanges") : t("buttons.createChannel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-8">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("teacherChannel.labels.preview")}
                </span>
              </div>
              <Badge variant="secondary" className="rounded-md font-bold text-[9px] uppercase tracking-widest bg-red-500/10 text-red-600">
                {t("teacherChannel.labels.livePreview")}
              </Badge>
            </div>

            <motion.div
              initial={false}
              onMouseEnter={() => setIsPreviewHovered(true)}
              onMouseLeave={() => setIsPreviewHovered(false)}
              className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-primary/10 shadow-2xl group bg-black"
            >
              <AnimatePresence>
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
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <motion.img
                    key="thumbnail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={watchedValues.thumbnailUrl || identity?.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
              </AnimatePresence>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-8 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none text-start">
                    {watchedValues.headline || identity?.name || "Teacher Name"}
                  </h3>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-primary/20 text-white border-none rounded-lg text-[9px] font-black uppercase tracking-widest px-2 py-0.5 backdrop-blur-md">
                      {t("roles.teacher")}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold">
                      <BarChart3 className="h-3 w-3" />
                      {channelData?.data?.totalViews.toLocaleString() || 0} {t("teacherChannel.labels.views")}
                    </div>
                  </div>
                </div>

                <p className="text-sm font-medium text-white/90 line-clamp-3 leading-relaxed text-start">
                  {watchedValues.bio || "Your channel biography will appear here. Students use this to decide if they want to join your classes."}
                </p>

                <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-xl shadow-black/20 text-xs">
                  {t("buttons.viewClasses")}
                </Button>
              </div>
            </motion.div>

            <div className="mt-6 p-6 rounded-3xl bg-primary/5 border border-primary/5 backdrop-blur-sm">
              <div className="flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-primary/80 leading-relaxed text-start">
                  Hover over the card to see how your trailer video will auto-play for students in the discovery catalog. A great trailer can boost enrollment by 40%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherChannelPage;
