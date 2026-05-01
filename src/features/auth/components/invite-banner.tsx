import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Users, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { BASE_URL } from "@/constants/api";
import { cn } from "@/lib/utils";

interface InviteBannerProps {
  inviteCode: string;
}

interface ClassInfo {
  name: string;
  teachers: Array<{
    teacher: {
      name: string;
      image: string | null;
    };
  }>;
}

export const InviteBanner: React.FC<InviteBannerProps> = ({ inviteCode }) => {
  const { t, i18n } = useTranslation();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/classes/invite/${inviteCode}`);
        setClassInfo(response.data.data);
      } catch (err) {
        console.error("Failed to resolve invite code", err);
      }
    };

    if (inviteCode) {
      fetchClassInfo();
    }
  }, [inviteCode]);

  if (!isVisible || !classInfo) return null;

  const teacherName = classInfo.teachers?.[0]?.teacher?.name || t("common.teacher");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-primary/10 border-b border-primary/20 backdrop-blur-md relative overflow-hidden"
      >
        <div className="container-center py-3 md:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary/20 items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 leading-none mb-1">
                {t("classes.show.toast.inviteLinkDetected", "Invite Link Detected")}
              </p>
              <h4 className="text-sm md:text-base font-bold text-foreground leading-tight">
                {isAr ? (
                  <>
                    أنت تنضم إلى <span className="text-primary">{classInfo.name}</span> مع{" "}
                    <span className="text-primary">{teacherName}</span>
                  </>
                ) : (
                  <>
                    You are joining <span className="text-primary">{classInfo.name}</span> with{" "}
                    <span className="text-primary">{teacherName}</span>
                  </>
                )}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {inviteCode}
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Animated Background Element */}
        <motion.div
          animate={{ x: ["0%", "100%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 start-0 h-[2px] w-1/3 bg-linear-to-r from-transparent via-primary to-transparent opacity-30"
        />
      </motion.div>
    </AnimatePresence>
  );
};
