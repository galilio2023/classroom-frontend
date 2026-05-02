import React, { useState } from "react";
import { useCustom, useList, useNavigation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
  Users,
  Search,
  Filter,
  Building2,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";
import { cn } from "@/lib/utils";

const EmployeesListPage: React.FC = () => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;
  const { isCorporateSuite } = useCapabilities();
  const [filters, setFormData] = useState({
    name: "",
    departmentId: "all",
    complianceStatus: "all",
  });

  const { query } = useCustom<any[]>({
    url: `${import.meta.env.VITE_API_URL}/reports/employees`,
    method: "get",
    config: {
      query: {
        name: filters.name,
        departmentId: filters.departmentId === "all" ? undefined : filters.departmentId,
        complianceStatus: filters.complianceStatus === "all" ? undefined : filters.complianceStatus,
      },
    },
  });

  const { data: queryData, isLoading, refetch } = query;

  const { query: deptsQuery } = useList({ resource: "departments" });
  const departments = deptsQuery.data?.data || [];

  if (!isCorporateSuite) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-destructive">
        Unauthorized
      </div>
    );
  }

  const employees = queryData?.data || [];

  const getComplianceBadge = (emp: any) => {
    if (emp.riskLevel === "critical") {
      return (
        <Badge className="bg-destructive/10 text-destructive border-none uppercase text-[9px] font-black tracking-widest">
          Overdue
        </Badge>
      );
    }
    if (emp.programsAssigned > 0) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-none uppercase text-[9px] font-black tracking-widest">
          Compliant
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground border-none uppercase text-[9px] font-black tracking-widest">
        Not Started
      </Badge>
    );
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 shadow-sm border border-blue-500/5">
            <Users className="h-8 w-8" />
          </div>
          <div className="text-start">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic leading-none">
              Workforce Hub
            </h1>
            <p className="text-muted-foreground font-medium mt-1.5 uppercase tracking-widest text-[10px]">
              Active Employee Compliance Monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => push("/admin/import")}
            variant="outline"
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[9px] gap-2 border-border/60"
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
          <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[9px] gap-2 shadow-xl shadow-primary/20">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-[2rem] border-border/40 shadow-xl bg-card/40 backdrop-blur-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              Employee Search
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => setFormData({ ...filters, name: e.target.value })}
                className="pl-11 h-12 rounded-2xl bg-muted/30 border-none text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              Department
            </label>
            <Select
              value={filters.departmentId}
              onValueChange={(val) => setFormData({ ...filters, departmentId: val })}
            >
              <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none text-xs font-bold px-5">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d: any) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              Compliance Status
            </label>
            <Select
              value={filters.complianceStatus}
              onValueChange={(val) => setFormData({ ...filters, complianceStatus: val })}
            >
              <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none text-xs font-bold px-5">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Workforce Table */}
      <Card className="rounded-[2.5rem] border-border/40 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Employee
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Org Unit
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Programs
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Completion
                </TableHead>
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                  Status
                </TableHead>
                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-[10px]">
                  Analytics
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
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-12" />
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <Skeleton className="h-10 w-10 ml-auto rounded-full" />
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
                      className="border-border/20 group hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => push(`/corporate/employees/${emp.id}`)}
                    >
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-xl border border-border/40 shadow-sm">
                            <AvatarImage src={emp.image || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                              {emp.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-black text-sm uppercase tracking-tight">
                            {emp.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-bold text-xs text-muted-foreground uppercase">
                            {emp.departmentName || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase">
                          <LayoutGrid className="h-3.5 w-3.5" />
                          {emp.programsAssigned}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between items-center px-0.5">
                            <span className="text-[10px] font-black">
                              {Math.round(emp.completionRate)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-1000"
                              style={{ width: `${emp.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-start">
                        {getComplianceBadge(emp)}
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all ml-auto">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="p-10 rounded-full bg-muted/10 text-muted-foreground/20">
                        <Users className="h-16 w-16" />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black uppercase italic text-muted-foreground/40">
                            No employees yet — import your team
                          </h3>
                          <p className="text-sm text-muted-foreground/30 font-medium">
                            Kickstart compliance tracking by onboarding your personnel.
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            push("/admin/import");
                          }}
                          className="rounded-xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl"
                        >
                          <Upload className="h-4 w-4" />
                          Bulk Import
                        </Button>
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

export default EmployeesListPage;
