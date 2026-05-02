import React from "react";
import { useCustom, useNavigation } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  ArrowLeft,
  Briefcase,
  Award,
  Clock,
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
  FileText,
  Mail,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { motion, AnimatePresence } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const EmployeeShowPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { push } = useNavigation() as any;
  const { isCorporateSuite } = useCapabilities();

  const { query } = useCustom<any>({
    url: `${import.meta.env.VITE_API_URL}/users/id/${id}`,
    method: "get",
  });

  const { data: queryData, isLoading } = query;

  const { query: analyticsQuery } = useCustom<any>({
    url: `${import.meta.env.VITE_API_URL}/users/${id}/portfolio-analytics`,
    method: "get",
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = analyticsQuery;

  if (!isCorporateSuite) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-destructive">
        Unauthorized
      </div>
    );
  }

  const employee = queryData?.data;
  const analytics = analyticsData?.data;
  const programs = analytics?.recentClasses || [];

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-[1600px] mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => push("/corporate/employees")}
          className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-primary/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workforce
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl font-black uppercase tracking-widest text-[9px] border-border/60"
          >
            Internal Message
          </Button>
          <Button className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2">
            Update Role
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <Card className="rounded-[3rem] border-border/40 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl relative">
        <div className="absolute top-0 end-0 p-12 opacity-5 pointer-events-none">
          <Users className="w-64 h-64" />
        </div>
        <CardContent className="p-10 md:p-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-[2rem] border-4 border-background shadow-2xl">
              <AvatarImage src={employee?.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-5xl font-black">
                {employee?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-6 text-center md:text-start">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <Badge className="bg-primary text-white border-none font-black text-[10px] rounded-full px-4 py-1 uppercase tracking-widest">
                  Active Personnel
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] rounded-full px-4 py-1 uppercase tracking-widest">
                  Compliant
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                {isLoading ? <Skeleton className="h-16 w-96" /> : employee?.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-bold text-sm uppercase">{employee?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="font-bold text-sm uppercase">
                    {employee?.schoolName || "Global Operations"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 bg-background/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/40 shadow-inner">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Compliance
                </p>
                <p className="text-3xl font-black text-emerald-500">{analytics?.avgGrade || 0}%</p>
              </div>
              <div className="w-px h-10 bg-border/40" />
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Programs
                </p>
                <p className="text-3xl font-black">{programs.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Progress Detail */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight italic">
            Active Training Tracks
          </h2>
        </div>

        <Card className="rounded-[2.5rem] border-border/40 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Training Program
                  </TableHead>
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Strategic Area
                  </TableHead>
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Compliance Metric
                  </TableHead>
                  <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-[10px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAnalyticsLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i} className="border-border/20">
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-8 w-48" />
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-8 w-32" />
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-8 w-24" />
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <Skeleton className="h-10 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : programs.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {programs.map((prog: any, idx: number) => (
                      <motion.tr
                        key={prog.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-border/20 group hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="py-6 px-8 text-start">
                          <span className="font-black text-sm uppercase tracking-tight italic">
                            {prog.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-start">
                          <Badge
                            variant="outline"
                            className="rounded-full border-border/60 text-[9px] font-black uppercase tracking-widest"
                          >
                            {prog.subject || "Skill Enhancement"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-start">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-xs">{analytics?.avgGrade || 0}%</span>
                            <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${analytics?.avgGrade || 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl h-10 font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-primary/5"
                          >
                            Details
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <p className="text-sm text-muted-foreground font-medium italic">
                        No active training tracks detected for this personnel.
                      </p>
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

export default EmployeeShowPage;
