import React, { useState } from "react";
import { useNavigation, useCustomMutation, useCustom } from "@refinedev/core";
import { TeacherChannel } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tv, 
  PlayCircle, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Users
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export const TeacherDiscoveryList = () => {
  const { t } = useTranslation();
  const { show } = useNavigation();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  const { mutate: recordView } = useCustomMutation();

  const { query } = useCustom<TeacherChannel[]>({
    url: "/channels/trending",
    method: "get",
  });

  const channels = query.data?.data;
  const isLoading = query.isLoading;

  const handleHover = (channelId: number) => {
    if (hoveredId === channelId) return;
    setHoveredId(channelId);
    // Task 4.1: Record view in Redis via backend
    recordView({
        url: `/channels/${channelId}/view`,
        method: "post",
        values: {},
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="min-w-[300px] h-[450px] rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Tv className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">{t("classes.list.discover")}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-primary/10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-primary/10">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar scroll-smooth px-2"
      >
        {channels?.map((channel) => (
          <motion.div
            key={channel.id}
            variants={item}
            layoutId={`channel-${channel.id}`}
            onMouseEnter={() => handleHover(channel.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="min-w-[320px] md:min-w-[380px] relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-primary/10 shadow-xl group bg-black cursor-pointer"
            onClick={() => show("users", channel.teacherId)}
          >
            <AnimatePresence mode="wait">
              {hoveredId === channel.id && channel.trailerVideoUrl ? (
                <motion.video
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={channel.trailerVideoUrl}
                  autoPlay
                  muted
                  loop
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                />
              ) : (
                <motion.img
                  key="image"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={channel.thumbnailUrl || (channel.teacher as any)?.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
            </AnimatePresence>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Hover Play Indicator */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {!hoveredId && <PlayCircle className="h-16 w-16 text-white/80" />}
            </div>

            {/* Top Badge */}
            <div className="absolute top-6 left-6 flex gap-2">
                <Badge className="bg-primary text-white border-none rounded-lg px-3 py-1 font-black uppercase tracking-widest text-[8px] flex items-center gap-1 shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    Trending
                </Badge>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 space-y-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {channel.headline}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-white/90 text-sm font-black uppercase tracking-tight">
                    {(channel.teacher as any)?.name}
                  </span>
                  <div className="flex items-center gap-1 text-white/60 text-[10px] font-bold">
                    <Users className="h-3 w-3" />
                    {channel.totalViews.toLocaleString()} {t("teacherChannel.labels.views")}
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-white/70 line-clamp-2 leading-relaxed">
                {channel.bio}
              </p>

              <div className="flex gap-2 pt-2">
                <Button 
                    className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest bg-white text-black hover:bg-primary hover:text-white border-none transition-all shadow-xl shadow-black/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        show("users", channel.teacherId);
                    }}
                >
                  {t("buttons.viewProfile")}
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-2xl border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all"
                >
                    <PlusCircleIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const PlusCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
);
