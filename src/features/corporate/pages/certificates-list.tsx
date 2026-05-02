import React, { useState } from "react";
import { useCustom, useList, useNavigation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
  Award,
  Download,
  Search,
  Filter,
  Calendar,
  Briefcase,
  UserCircle,
  FileText,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const CertificatesListPage: React.FC = () => {
  const { t } = useTranslation();
  const { isCorporateSuite } = useCapabilities();
  const [filters, setFormData] = useState({
    employeeName: "",
    programId: "all",
    startDate: "",
    endDate: "",
  });

  const { query } = useCustom<any[]>({
    url: `${import.meta.env.VITE_API_URL}/reports/certificates`,
    method: "get",
    config: {
      query: {
        employeeName: filters.employeeName,
        programId: filters.programId === "all" ? undefined : filters.programId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    },
  });

  const { data: queryData, isLoading, refetch } = query;

  const { query: programsQuery } = useList({ resource: "classes" });

  const handleDownload = (id: string) => {
    const url = `${import.meta.env.VITE_API_URL}/reports/certificate/${id}/pdf`;
    window.open(url, "_blank");
  };

  if (!isCorporateSuite) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-destructive">
        Unauthorized
      </div>
    );
  }

  const certificates = queryData?.data || [];
  const programs = programsQuery.data?.data || [];

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-purple-500/10 text-purple-500 shadow-sm border border-purple-500/5">
            <Award className="h-8 w-8" />
          </div>
          <div className="text-start">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic leading-none">
              Certificate Registry
            </h1>
            <p className="text-muted-foreground font-medium mt-1.5 uppercase tracking-widest text-[10px]">
              Official Workforce Training Attestations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[9px] gap-2 border-border/60"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </Button>
          <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[9px] gap-2 shadow-xl shadow-purple-500/20">
            <Download className="h-4 w-4" />
            Bulk Export
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-[2rem] border-border/40 shadow-xl bg-card/40 backdrop-blur-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              Employee Name
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={filters.employeeName}
                onChange={(e) => setFormData({ ...filters, employeeName: e.target.value })}
                className="pl-11 h-12 rounded-2xl bg-muted/30 border-none text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              Training Program
            </label>
            <Select
              value={filters.programId}
              onValueChange={(val) => setFormData({ ...filters, programId: val })}
            >
              <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none text-xs font-bold px-5">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              From Date
            </label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFormData({ ...filters, startDate: e.target.value })}
              className="h-12 rounded-2xl bg-muted/30 border-none text-xs font-bold px-5"
            />
          </div>

          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              To Date
            </label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFormData({ ...filters, endDate: e.target.value })}
              className="h-12 rounded-2xl bg-muted/30 border-none text-xs font-bold px-5"
            />
          </div>
        </div>
      </Card>

      {/* Registry Table */}
      <Card className="rounded-[2.5rem] border-border/40 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Employee
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Training Program
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Issued Date
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Reference ID
                </TableHead>
                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-[10px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/20">
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-10 w-40" />
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-48" />
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
              ) : certificates.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {certificates.map((cert: any, idx: number) => (
                    <motion.tr
                      key={cert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-border/20 group hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black uppercase shadow-sm">
                            {cert.employeeName.slice(0, 2)}
                          </div>
                          <span className="font-black text-sm uppercase tracking-tight">
                            {cert.employeeName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-bold text-xs text-muted-foreground uppercase">
                            {cert.programName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase">
                          <Calendar className="h-3.5 w-3.5" />
                          {dayjs(cert.issuedAt).format("MMM DD, YYYY")}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <code className="text-[10px] font-mono bg-muted/50 px-2 py-1 rounded border border-border/40 font-bold">
                          {cert.certificateNumber}
                        </code>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <Button
                          onClick={() => handleDownload(cert.id)}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-purple-500 hover:text-white transition-all"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Download PDF
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-8 rounded-full bg-muted/10 text-muted-foreground/20">
                        <Award className="h-16 w-16" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase italic text-muted-foreground/40">
                          No certificates issued yet
                        </h3>
                        <p className="text-sm text-muted-foreground/30 font-medium">
                          Compliance credentials will appear here once training is completed.
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
  );
};

export default CertificatesListPage;
