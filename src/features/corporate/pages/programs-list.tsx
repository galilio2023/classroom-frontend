import React, { useState } from "react";
import { useCustom, useNavigation, useList, useCustomMutation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Filter,
  Search,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";
import { toast } from "sonner";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const ProgramsListPage: React.FC = () => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;
  const { isCorporateSuite } = useCapabilities();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { query } = useCustom<any[]>({
    url: `${import.meta.env.VITE_API_URL}/programs`,
    method: "get",
  });

  const { data: queryData, isLoading, refetch } = query;

  const { query: deptsQuery } = useList({ resource: "departments" });
  const { mutate: createProgram, mutation: createMutation } = useCustomMutation();
  const isCreating = createMutation.isPending;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    assignTo: "all",
    departmentId: "",
  });

  const handleCreate = () => {
    createProgram(
      {
        url: `${import.meta.env.VITE_API_URL}/programs/create`,
        method: "post",
        values: formData,
      },
      {
        onSuccess: () => {
          toast.success("Training program launched successfully.");
          setIsCreateOpen(false);
          refetch();
          setFormData({
            name: "",
            description: "",
            deadline: "",
            assignTo: "all",
            departmentId: "",
          });
        },
      }
    );
  };

  if (!isCorporateSuite) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-destructive">
        Unauthorized
      </div>
    );
  }

  const programs = queryData?.data || [];
  const departments = deptsQuery.data?.data || [];

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 shadow-sm border border-blue-500/5">
            <Briefcase className="h-8 w-8" />
          </div>
          <div className="text-start">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic leading-none">
              Training Programs
            </h1>
            <p className="text-muted-foreground font-medium mt-1.5 uppercase tracking-widest text-[10px]">
              Strategic Skill Acquisition Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search programs..."
              className="pl-11 h-12 w-64 rounded-2xl bg-muted/30 border-none text-xs font-bold"
            />
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Launch Program
          </Button>
        </div>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="h-64 animate-pulse bg-muted/10 rounded-[2.5rem] border-border/40"
            />
          ))
        ) : programs.length > 0 ? (
          <AnimatePresence>
            {programs.map((program: any, idx: number) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  onClick={() => push(`/corporate/programs/${program.id}`)}
                  className="rounded-[2.5rem] border-border/40 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden group bg-card/40 backdrop-blur-3xl"
                >
                  <CardContent className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <LayoutGrid className="h-6 w-6" />
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                        Active
                      </Badge>
                    </div>

                    <div className="space-y-3 text-start">
                      <h3 className="text-2xl font-black tracking-tight leading-[1.1] group-hover:text-primary transition-colors line-clamp-2 uppercase italic">
                        {program.name}
                      </h3>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-black uppercase tracking-tighter">
                            {program.assignedCount} Assigned
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-black uppercase tracking-tighter">
                            {program.completionRate}% Done
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                        <Clock className="h-3.5 w-3.5" />
                        Deadline:{" "}
                        {program.deadline
                          ? dayjs(program.deadline).format("MMM DD, YYYY")
                          : "No Deadline"}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-10 rounded-full bg-muted/10 text-muted-foreground/30">
              <Briefcase className="h-20 w-24" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase italic">
                No programs yet — launch your first one
              </h3>
              <p className="text-muted-foreground font-medium max-w-sm">
                Strategic training initiatives will appear here once launched.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Program Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl rounded-[3rem] border-none shadow-3xl bg-card/60 backdrop-blur-3xl p-0 overflow-hidden">
          <div className="p-10 space-y-10">
            <DialogHeader className="text-start">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic">
                  Launch Training Program
                </DialogTitle>
              </div>
              <DialogDescription className="font-medium text-muted-foreground">
                Deploy a new strategic skill track to your workforce.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3 text-start">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ps-1">
                    Program Name
                  </Label>
                  <Input
                    placeholder="e.g. Cybersecurity Essentials"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-14 rounded-2xl bg-muted/40 border-none px-5 font-bold"
                  />
                </div>
                <div className="space-y-3 text-start">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ps-1">
                    Target Deadline
                  </Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="h-14 rounded-2xl bg-muted/40 border-none px-5 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3 text-start">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ps-1">
                  Strategy & Description
                </Label>
                <Textarea
                  placeholder="Outline the goals of this training program..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] rounded-3xl bg-muted/40 border-none p-5 font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3 text-start">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ps-1">
                    Assignment Scope
                  </Label>
                  <Select
                    value={formData.assignTo}
                    onValueChange={(val) => setFormData({ ...formData, assignTo: val })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-muted/40 border-none px-5 font-bold">
                      <SelectValue placeholder="Who should enroll?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="department">Specific Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.assignTo === "department" && (
                  <div className="space-y-3 text-start animate-in fade-in slide-in-from-top-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ps-1">
                      Target Department
                    </Label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/40 border-none px-5 font-bold">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {departments.map((d: any) => (
                          <SelectItem key={d.id} value={d.id.toString()}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-6">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[9px] border-border/60"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !formData.name}
                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 gap-2"
              >
                {isCreating && <TrendingUp className="h-4 w-4 animate-spin" />}
                Launch Now
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramsListPage;
