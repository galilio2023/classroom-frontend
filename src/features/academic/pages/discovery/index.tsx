import React, { useState } from "react";
import { useList, useNavigation } from "@refinedev/core";
import {
  Tv,
  Search,
  // //   Sparkles,
  // //   Play,
  // //   Users,
  ArrowRight,
  TrendingUp,
  Loader2,
  Video,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { TeacherChannel, User } from "@/types";
import { useTranslation } from "react-i18next";
import {} from "@/lib/utils";
import { usePersistentLive } from "@/features/classes/hooks/use-persistent-live";
import { Helmet } from "react-helmet-async";

const TeacherCard = React.memo(
  ({
    channel,
    onShow,
  }: {
    channel: TeacherChannel & { teacher: User };
    onShow: (id: string) => void;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { t } = useTranslation();

    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="group relative aspect-[4/5.5] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-border/40 bg-black shadow-2xl transition-all duration-500"
      >
        <AnimatePresence mode="wait">
          {isHovered && channel.trailerVideoUrl ? (
            <motion.video
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={channel.trailerVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
          ) : (
            <motion.img
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={
                channel.thumbnailUrl ||
                channel.teacher.image ||
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"
              }
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
              alt={channel.teacher.name}
              loading="lazy"
            />
          )}
        </AnimatePresence>

        {/* Modern Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-90 transition-opacity duration-500" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 space-y-6 z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 backdrop-blur-md text-white border-primary/20 rounded-full px-4 py-1 font-black uppercase tracking-widest text-[10px] md:text-[11px]">
                Top Rated
              </Badge>
              {channel.totalViews > 1000 && (
                <Badge
                  variant="secondary"
                  className="bg-white/10 text-white border-none backdrop-blur-md rounded-full px-4 py-1 font-black uppercase tracking-widest text-[10px] md:text-[11px]"
                >
                  Trending
                </Badge>
              )}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-[0.9] uppercase text-start">
              {channel.headline || channel.teacher.name}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarImage src={channel.teacher.image || undefined} />
              <AvatarFallback className="bg-primary/20 text-white font-black text-xs">
                {channel.teacher.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-start">
              <p className="text-sm font-black text-white">{channel.teacher.name}</p>
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/40">
                {channel.totalViews.toLocaleString()} Views
              </p>
            </div>
          </div>

          <Button
            onClick={() => onShow(channel.teacher.id)}
            className="w-full h-14 rounded-2xl bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[10px] gap-3 transition-all duration-500 shadow-2xl"
          >
            <Video className="h-4 w-4" />
            Watch Channel
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </motion.div>
    );
  }
);

TeacherCard.displayName = "TeacherCard";

const DiscoveryPage = () => {
  const { t } = useTranslation();
  const { show } = useNavigation();
  const { setPromotionTrailer } = usePersistentLive();
  const [search, setSearch] = useState("");

  const { query: channelsQuery } = useList<TeacherChannel & { teacher: User }>({
    resource: "teacher-channels",
    pagination: { pageSize: 12 }, // 🚀 Snappier load
    filters: search ? [{ field: "headline", operator: "contains", value: search }] : [],
    meta: { populate: ["teacher"] },
  });

  const channels = channelsQuery.data;
  const isLoading = channelsQuery.isLoading;

  const handleShowChannel = (teacherId: string) => {
    // Find the specific channel data to set the trailer
    const channel = channels?.data.find((c) => c.teacher.id === teacherId);
    if (channel?.trailerVideoUrl) {
      setPromotionTrailer(channel.trailerVideoUrl, channel.teacher.name, channel.headline);
    }
    show("users", teacherId);
  };

  return (
    <div className="container-center section-wrapper !pt-10">
      <Helmet>
        <title>Teacher TV | Discover the Best Educators</title>
        <meta
          name="description"
          content="Explore high-definition teacher channels, watch trailers, and discover your next interactive classroom on Tablawy OS."
        />
        <meta property="og:title" content="Teacher TV | Discovery" />
        <meta
          property="og:description"
          content="Discover top educators through immersive video channels."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="noise-overlay" />

      {/* Cinematic Header */}
      <header className="space-y-12 mb-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 text-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">
              <Tv className="h-3.5 w-3.5" />
              Live Discovery
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-gradient">
              Teacher <span className="text-primary/30">TV</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl">
              Discover the best educators in Egypt through high-definition channels and immersive
              trailers.
            </p>
          </div>

          <div className="relative group w-full md:w-[400px]">
            <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-ai-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute start-6 h-5 w-5 text-muted-foreground/40" />
              <Input
                placeholder="Search for subjects or teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-16 ps-16 pe-8 rounded-full bg-card border-border/40 shadow-xl font-bold placeholder:text-muted-foreground/20 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 overflow-x-auto pb-4 scrollbar-hide">
          {["All", "Physics", "Mathematics", "Biology", "Chemistry", "Languages"].map((cat) => (
            <button
              key={cat}
              className="shrink-0 px-8 py-3 rounded-full border border-border/40 bg-card hover:bg-primary hover:text-white hover:border-primary transition-all font-black uppercase tracking-widest text-[10px]"
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Grid Section */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40 stroke-[1]" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              Loading Broadcasts...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {channels?.data.map((channel: TeacherChannel & { teacher: User }) => (
              <TeacherCard key={channel.id} channel={channel} onShow={handleShowChannel} />
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && channels?.data.length === 0 && (
        <div className="text-center py-40 space-y-6">
          <div className="p-8 rounded-full bg-muted/30 w-fit mx-auto">
            <Video className="h-12 w-12 text-muted-foreground/20" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">No Broadcasters Found</h2>
          <p className="text-muted-foreground font-medium">
            Try searching for a different subject or teacher name.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;
