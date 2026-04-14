import { motion } from "framer-motion";
import {
  Calendar,
  UserCheck,
  UserMinus,
  CheckCircle2,
  XCircle,
  QrCode,
  ArrowRight,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface AttendanceSessionItemProps {
  session: any;
  isStaff: boolean;
  onRowClick: (session: any) => void;
  onQrClick: (classId: string) => void;
  style?: React.CSSProperties;
}

export const AttendanceSessionItem = ({
  session,
  isStaff,
  onRowClick,
  onQrClick,
  style,
}: AttendanceSessionItemProps) => {
  const { t } = useTranslation();
  const sessionDate = dayjs(session.date);

  return (
    <div style={style} className="px-8">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row items-center h-full border-b border-primary/5 hover:bg-primary/2 transition-all group cursor-pointer text-start"
        onClick={() => onRowClick(session)}
      >
        {/* Icon */}
        <div className="relative shrink-0 mb-4 md:mb-0">
          <div className="h-14 w-14 rounded-2xl border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-primary/10 text-primary">
            <Calendar className="h-7 w-7" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 md:ms-8 text-center md:text-start min-w-0 w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors text-start">
              {session.class?.name}
            </h3>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Badge
                variant="outline"
                className="text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
              >
                {sessionDate.format("MMM D, YYYY")}
              </Badge>
              <Badge className="bg-primary/5 text-primary border-none font-black px-2 py-0.5 rounded-md text-[10px] md:text-[11px] tracking-widest uppercase">
                {sessionDate.fromNow()}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
            {isStaff ? (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-green-500/5">
                    <UserCheck className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs font-bold text-green-600">
                    {session.presentCount}{" "}
                    <span className="text-muted-foreground/50 font-medium text-start">
                      {t("classes.attendance.present")}
                    </span>
                  </span>
                </div>
                {(session.absentCount || 0) > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground text-start">
                    <div className="p-1.5 rounded-lg bg-destructive/5">
                      <UserMinus className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <span className="text-xs font-bold text-destructive">
                      {session.absentCount}{" "}
                      <span className="text-muted-foreground/50 font-medium text-start">
                        {t("classes.attendance.absent")}
                      </span>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-start">
                <div
                  className={cn(
                    "p-1.5 rounded-lg",
                    session.status === "present" ? "bg-green-500/5" : "bg-destructive/5"
                  )}
                >
                  {session.status === "present" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-black uppercase tracking-widest",
                    session.status === "present" ? "text-green-600" : "text-destructive"
                  )}
                >
                  {session.status === "present"
                    ? t("classes.attendance.present")
                    : t("classes.attendance.absent")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
          <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            {isStaff && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                onClick={(e) => {
                  e.stopPropagation();
                  onQrClick(session.classId.toString());
                }}
              >
                <QrCode className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {t("buttons.viewDetails")}
            <ArrowRight className="h-4 w-4 ms-2" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl md:hidden lg:flex"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-[1.5rem] p-2 bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl text-start"
            >
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">
                {t("classes.attendance.governance.sessionOptions")}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onRowClick(session)}
                className="rounded-xl gap-3 py-3 cursor-pointer"
              >
                <Eye className="h-4 w-4 text-primary" />
                <span className="font-bold">
                  {t("classes.attendance.governance.viewFullReport")}
                </span>
              </DropdownMenuItem>
              {isStaff && (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={() => onQrClick(session.classId.toString())}
                    className="rounded-xl gap-3 py-3 cursor-pointer"
                  >
                    <QrCode className="h-4 w-4 text-primary" />
                    <span className="font-bold">
                      {t("classes.attendance.governance.startQrCheckin")}
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    </div>
  );
};
