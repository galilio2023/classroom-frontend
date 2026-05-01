import React from "react";
import { useCustom, useNavigation } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  LayoutGrid,
  ShieldCheck,
  Zap,
  MoreHorizontal,
  Mail,
  UserCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const ProgramShowPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { push } = useNavigation() as any;
  const { isCorporateSuite } = useCapabilities();

  const { query } = useCustom<any>({
    url: `${import.meta.env.VITE_API_URL}/programs/${id}`,
    method: "get",
  });

  const { data: queryData, isLoading } = query;

  if (!isCorporateSuite) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-destructive">
        Unauthorized
      </div>
    );
  }

  const program = queryData?.data;
  const employees = program?.employees || [];

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-[1600px] mx-auto">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => push("/corporate/programs")}
          className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-primary/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Programs
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl font-black uppercase tracking-widest text-[9px] border-border/60"
          >
            Export Report
          </Button>
          <Button className="rounded-xl font-black uppercase tracking-widest text-[9px]">
            Manage Content
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="rounded-[3rem] border-border/40 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl relative group">
        <div className="absolute top-0 end-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Briefcase className="w-64 h-64" />
        </div>
        <CardContent className="p-10 md:p-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6 text-start">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] rounded-full px-4 py-1 uppercase tracking-widest">
                  Training Program
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] rounded-full px-4 py-1 uppercase tracking-widest">
                  Active Status
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                {isLoading ? <Skeleton className="h-16 w-96" /> : program.name}
              </h1>
              <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  program.description ||
                  "Strategic training initiative designed to enhance workforce capabilities."
                )}
              </p>
            </div>

            <div className="flex items-center gap-8 bg-background/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/40 shadow-inner">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Enrolled
                </p>
                <p className="text-3xl font-black">{employees.length}</p>
              </div>
              <div className="w-px h-10 bg-border/40" />
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Target Date
                </p>
                <p className="text-3xl font-black text-primary">
                  {program?.updatedAt ? dayjs(program.updatedAt).format("MMM DD") : "--"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight italic">
              Employee Compliance Tracking
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1 border-emerald-500/20 text-emerald-600 font-black text-[9px] uppercase tracking-widest"
            >
              {employees.filter((e: any) => e.status === "approved").length} Compliant
            </Badge>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-border/40 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Employee
                  </TableHead>
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Enrollment Date
                  </TableHead>
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Progress Status
                  </TableHead>
                  <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-[10px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className="border-border/20">
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-10 w-40" />
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-8 w-24" />
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-8 w-32" />
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <Skeleton className="h-10 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : employees.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {employees.map((emp: any, idx: number) => (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-border/20 group hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="py-6 px-8 text-start">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 rounded-xl border-2 border-background shadow-lg">
                              <AvatarImage src={emp.image || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary font-black">
                                {emp.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-black text-sm uppercase tracking-tight">
                                {emp.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium italic">
                                Full Access Employee
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-start text-xs font-bold text-muted-foreground uppercase">
                          {dayjs(program.createdAt).format("MMM DD, YYYY")}
                        </TableCell>
                        <TableCell className="py-6 px-8 text-start">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                            Enrollment Verified
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                              <UserCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-10 w-10 text-muted-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-6 rounded-full bg-muted/10 text-muted-foreground/30">
                          <Users className="h-12 w-12" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase italic text-muted-foreground/40">
                            No employees assigned yet
                          </h3>
                          <p className="text-sm text-muted-foreground/30 font-medium">
                            Add personnel to start tracking compliance.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgramShowPage;
