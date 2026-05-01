import React, { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Upload,
  Check,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

export default function SetupWizardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Step 1: Org Map ---
  const [departments, setDepartments] = useState<string[]>(["Engineering", "Sales", "HR"]);
  const [newDept, setNewDept] = useState("");

  // --- Step 2: Employee Sync ---
  const [employees, setEmployees] = useState<any[]>([]);

  // --- Step 3: Compliance ---
  const [policies, setCompliancePolicies] = useState({
    autoArchive: true,
    weeklyReport: true,
    aiPersonalization: true,
  });

  const { mutate: completeSetup, mutation: setupMutation } = useCustomMutation();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setEmployees(results.data);
        setIsSyncing(false);
        toast.success(`${results.data.length} employees identified from broadcast.`);
      },
      error: () => {
        setIsSyncing(false);
        toast.error("Failed to parse employee manifest.");
      },
    });
  };

  const handleFinish = () => {
    completeSetup(
      {
        url: "/suite/setup-complete",
        method: "post",
        values: {
          departments,
          employeeCount: employees.length,
          policies,
        },
      },
      {
        onSuccess: () => {
          toast.success("Corporate ecosystem initialized.");
          navigate("/corporate/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-muted/5">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4">
            <Building2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Onboarding Wizard
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            Initialize your <br /> <span className="text-indigo-600">Corporate Suite</span>
          </h1>
          <div className="flex items-center justify-center gap-4 pt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 w-12 rounded-full transition-all duration-500",
                  s <= step ? "bg-indigo-600" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="rounded-4xl border-border/40 shadow-2xl p-8 md:p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Building2 className="h-48 w-48" />
                </div>
                <CardHeader className="px-0 pt-0 pb-10">
                  <CardTitle className="text-2xl font-black uppercase">
                    Step 1: Org Structure
                  </CardTitle>
                  <CardDescription className="text-lg font-medium">
                    Define the departments that will use Tablawy OS.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Add Department
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        placeholder="e.g. Product Design"
                        className="h-14 rounded-2xl border-border/40 bg-muted/20"
                      />
                      <Button
                        onClick={() => {
                          if (newDept) setDepartments([...departments, newDept]);
                          setNewDept("");
                        }}
                        className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {departments.map((dept) => (
                      <Badge
                        key={dept}
                        className="h-12 px-6 rounded-2xl bg-white border border-border/40 text-foreground font-black uppercase text-[10px] group shadow-sm"
                      >
                        {dept}
                        <button
                          onClick={() => setDepartments(departments.filter((d) => d !== dept))}
                          className="ms-3 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <div className="pt-10 flex justify-end">
                  <Button
                    size="lg"
                    onClick={() => setStep(2)}
                    className="h-16 px-12 rounded-[2rem] bg-black text-white hover:bg-indigo-600 font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                  >
                    Next: Employee Sync <ChevronRight className="ms-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="rounded-4xl border-border/40 shadow-2xl p-8 md:p-12">
                <CardHeader className="px-0 pt-0 pb-10">
                  <CardTitle className="text-2xl font-black uppercase">
                    Step 2: Employee Manifest
                  </CardTitle>
                  <CardDescription className="text-lg font-medium">
                    Bulk import your workforce via CSV sync.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-4xl py-20 bg-muted/20 gap-6">
                  <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Users className="h-10 w-10 text-indigo-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-black uppercase tracking-tighter text-xl">
                      Drag & Drop Manifest
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Download our template or use your own CSV.
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button className="h-14 px-8 rounded-2xl bg-white text-black border border-border/40 hover:bg-white/90 shadow-sm font-black uppercase tracking-widest text-[10px] gap-2">
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Upload CSV
                    </Button>
                  </div>
                  {employees.length > 0 && (
                    <Badge className="bg-green-100 text-green-700 font-black uppercase text-[10px] rounded-full px-4 py-1 animate-in zoom-in">
                      {employees.length} Records Verified
                    </Badge>
                  )}
                </CardContent>
                <div className="pt-10 flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                  >
                    <ChevronLeft className="me-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep(3)}
                    className="h-16 px-12 rounded-[2rem] bg-black text-white hover:bg-indigo-600 font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                  >
                    Next: Compliance <ChevronRight className="ms-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="rounded-4xl border-border/40 shadow-2xl p-8 md:p-12">
                <CardHeader className="px-0 pt-0 pb-10">
                  <CardTitle className="text-2xl font-black uppercase">
                    Step 3: Governance Policies
                  </CardTitle>
                  <CardDescription className="text-lg font-medium">
                    Activate automated oversight and reporting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  {[
                    {
                      id: "autoArchive",
                      title: "Auto-Archive Employees",
                      desc: "Automatically archive records after contract termination.",
                      icon: ShieldCheck,
                    },
                    {
                      id: "weeklyReport",
                      title: "Weekly AI Insight Digest",
                      desc: "Receive a high-level summary of company-wide skill growth.",
                      icon: Sparkles,
                    },
                    {
                      id: "aiPersonalization",
                      title: "Persona Alignment",
                      desc: "Allow AI to adjust learning content to employee job roles.",
                      icon: BrainCircuit,
                    },
                  ].map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/20 group hover:border-indigo-200 transition-all duration-500"
                    >
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <policy.icon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-sm uppercase tracking-tight">
                            {policy.title}
                          </h4>
                          <p className="text-xs text-muted-foreground font-medium">{policy.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={(policies as any)[policy.id]}
                        onCheckedChange={(val) =>
                          setCompliancePolicies({ ...policies, [policy.id]: val })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
                <div className="pt-10 flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                  >
                    <ChevronLeft className="me-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleFinish}
                    disabled={setupMutation.isPending}
                    className="h-16 px-12 rounded-[2rem] bg-indigo-600 text-white hover:bg-indigo-700 font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                  >
                    {setupMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Check className="ms-2 h-5 w-5" />
                    )}
                    Finalize suite
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
