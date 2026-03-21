import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Timer, 
  Zap, 
  Info, 
  Calendar as CalendarIcon 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AttendanceStatus, Enrollment } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// --- Stats Component ---
export const AttendanceStats = ({ stats }: { stats: any }) => {
  const { t } = useTranslation();
  const statConfig = [
    { label: t("classes.attendance.present" as any), value: stats?.present || 0, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { label: t("classes.attendance.absent" as any), value: stats?.absent || 0, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: t("classes.attendance.late" as any), value: stats?.late || 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-500/10" },
    { label: t("classes.attendance.excused" as any), value: stats?.excused || 0, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {statConfig.map((stat) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={cn("border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-[1.5rem] overflow-hidden group hover:shadow-2xl transition-all", stat.bg)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-start">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
                  <p className={cn("text-4xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// --- Mark Table Component ---
export const AttendanceMarkTable = ({ 
  enrollments, 
  attendanceData, 
  onStatusChange, 
  onValueChange, 
  isAr 
}: any) => {
  const { t } = useTranslation();
  return (
    <div className="px-4 pb-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none text-start">
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">{t("classes.attendance.table.student" as any)}</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">{t("classes.attendance.table.status" as any)}</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">{t("classes.attendance.table.minutes" as any)}</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">{t("classes.attendance.table.participation" as any)}</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">{t("classes.attendance.table.remarks" as any)}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment: Enrollment) => {
            const student = enrollment.student;
            const data = attendanceData[student.id] || { status: AttendanceStatus.ABSENT, remarks: "", minutesPresent: 0, participationScore: 0 };
            return (
              <motion.tr key={student.id} initial={{ opacity: 0, x: isAr ? 5 : -5 }} animate={{ opacity: 1, x: 0 }} className="group hover:bg-primary/[0.02] transition-colors border-b border-black/[0.03] dark:border-white/[0.03] text-start">
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:scale-110 transition-transform text-xs">
                      <AvatarImage src={student.image || ""} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">{student.name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{student.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Select value={data.status} onValueChange={(val) => onStatusChange(student.id, val)}>
                    <SelectTrigger className="w-[130px] h-11 rounded-xl bg-muted/20 border-none font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {[AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.EXCUSED].map(s => (
                        <SelectItem key={s} value={s} className="rounded-lg font-bold text-start">{t(`classes.attendance.${s.toLowerCase()}` as any)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-4">
                  <div className="relative w-24">
                    <Input type="number" value={data.minutesPresent} onChange={(e) => onValueChange(student.id, "minutesPresent", Number(e.target.value))} className={cn("h-11 rounded-xl bg-muted/10 border-none font-black text-center", isAr ? "pl-8" : "pr-8")} />
                    <Timer className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40", isAr ? "left-2.5" : "right-2.5")} />
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="relative w-24">
                    <Input type="number" min={0} max={10} value={data.participationScore} onChange={(e) => onValueChange(student.id, "participationScore", Number(e.target.value))} className={cn("h-11 rounded-xl bg-muted/10 border-none font-black text-center", isAr ? "pl-8" : "pr-8")} />
                    <Zap className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-yellow-500/40", isAr ? "left-2.5" : "right-2.5")} />
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Input value={data.remarks} onChange={(e) => onValueChange(student.id, "remarks", e.target.value)} className="h-11 rounded-xl bg-muted/10 border-none font-medium min-w-[150px]" />
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// --- History Table Component ---
export const AttendanceHistoryTable = ({ historyData, isTeacher, isAr }: any) => {
  const { t } = useTranslation();
  return (
    <div className="px-4 pb-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none text-start">
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">{t("classes.attendance.table.date" as any)}</TableHead>
            {isTeacher ? (
              ["present", "absent", "late", "excused"].map(s => (
                <TableHead key={s} className="text-[10px] font-black uppercase tracking-widest py-6">{t(`classes.attendance.${s}` as any)}</TableHead>
              ))
            ) : (
              ["status", "participation", "remarks"].map(s => (
                <TableHead key={s} className="text-[10px] font-black uppercase tracking-widest py-6">{t(`classes.attendance.table.${s}` as any)}</TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {historyData.map((group: any) => (
            <TableRow key={group.date} className="group hover:bg-primary/[0.02] transition-colors border-b border-black/[0.03] dark:border-white/[0.03] text-start">
              <TableCell className="py-6 font-black text-sm tracking-tight">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  {format(new Date(group.date), "PPP", { locale: isAr ? ar : undefined })}
                </div>
              </TableCell>
              {isTeacher ? (
                <>
                  <TableCell><Badge variant="outline" className="text-success border-success/20 bg-success/5">{group.present}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5">{group.absent}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-yellow-600 border-yellow-500/20 bg-yellow-500/5">{group.late}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-blue-600 border-blue-500/20 bg-blue-500/5">{group.excused}</Badge></TableCell>
                </>
              ) : (
                <>
                  <TableCell><Badge className="bg-primary/10 text-primary border-none">{group.records[0].status}</Badge></TableCell>
                  <TableCell><div className="flex items-center gap-2 font-black text-xs"><Zap className="h-3 w-3 text-yellow-500" />{group.records[0].participationScore}/10</div></TableCell>
                  <TableCell><div className="flex items-center gap-2 text-muted-foreground/60 italic text-xs font-medium"><Info className="h-3.5 w-3.5 opacity-40" />{group.records[0].remarks || t("classes.attendance.noRemarks" as any)}</div></TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
