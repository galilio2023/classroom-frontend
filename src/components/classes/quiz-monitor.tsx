import React, { useEffect, useState } from "react";
import { useSocket } from "@/contexts/socket-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Search, ShieldCheck, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LiveStudent {
  id: string;
  name: string;
  image?: string;
}

interface QuizMonitorProps {
  quizId: number;
  assignmentTitle: string;
}

export const QuizMonitor: React.FC<QuizMonitorProps> = ({
  quizId,
  assignmentTitle,
}) => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [activeStudents, setActiveStudents] = useState<LiveStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!socket || !quizId) return;

    // Join monitoring room
    socket.emit("quiz:monitor", quizId);

    const handleUpdate = (data: { students: LiveStudent[] }) => {
      setActiveStudents(data.students);
    };

    socket.on("quiz:update_members", handleUpdate);

    return () => {
      socket.off("quiz:update_members", handleUpdate);
    };
  }, [socket, quizId]);

  const handleNudge = (studentId: string, studentName: string) => {
    if (!socket) return;

    socket.emit("quiz:nudge", {
      studentId,
      quizId,
      message: t(
        "classes.monitor.nudgeMessage",
        "Need any help with this one?",
      ),
    });

    toast.success(
      t("classes.monitor.nudgeSentTo" as any, { name: studentName }),
    );
  };

  const filteredStudents = activeStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-3xl rounded-4xl overflow-hidden text-start">
      <CardHeader className="bg-primary/5 border-b border-primary/10 p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight">
                {t("classes.monitor.title", "Live Quiz Monitor")}
              </CardTitle>
            </div>
            <CardDescription className="font-bold text-muted-foreground/80">
              {assignmentTitle}
            </CardDescription>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {activeStudents.length} {t("classes.monitor.live", "Students Live")}
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("classes.monitor.search", "Filter students...")}
            className="ps-10 h-11 rounded-xl bg-background/50 border-none shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredStudents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-12 text-center space-y-3 opacity-40"
              >
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-xs font-black uppercase tracking-widest">
                  {t(
                    "classes.monitor.noStudents",
                    "No students currently active",
                  )}
                </p>
              </motion.div>
            ) : (
              filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-background/50 border border-black/3 dark:border-white/3 shadow-sm group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm rounded-xl">
                      <AvatarImage
                        src={student.image}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-xs">
                        {student.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black tracking-tight truncate">
                        {student.name}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        {t("classes.monitor.active", "Actively Testing")}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleNudge(student.id, student.name)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};
