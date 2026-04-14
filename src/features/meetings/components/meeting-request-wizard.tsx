import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  // //   User,
  Calendar as Users,
  // //   Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useList, useCustomMutation, useGetIdentity } from "@refinedev/core";
import {} from "date-fns";
import {} from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const MeetingRequestWizard = () => {
  const [step, setStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const { data: identity } = useGetIdentity<any>();
  const { query: childrenQuery } = useList({
    resource: "parent/dashboard",
  });
  const childrenData = childrenQuery.data;
  const _loadingChildrenn = childrenQuery.isLoading;

  const { mutate: createMeeting, mutation } = useCustomMutation();
  const isSubmitting = mutation.isPending;

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    const requestedAt = new Date(`${selectedDate}T${selectedTime}`);

    createMeeting(
      {
        url: "meetings",
        method: "post",
        values: {
          teacherId: selectedTeacher.id,
          studentId: selectedChild.id,
          requestedAt: requestedAt.toISOString(),
        },
        successNotification: () => ({
          type: "success",
          message: "Meeting Requested!",
          description: "AI is now drafting a diagnostic agenda based on your child's performance.",
        }),
      },
      {
        onSuccess: () => {
          setStep(4); // Success state
        },
      }
    );
  };

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden rounded-[3rem] border-none shadow-2xl bg-card/50 backdrop-blur-xl min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-10 border-b border-border/40 bg-linear-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight uppercase">Meeting Scheduler</h2>
            <p className="text-muted-foreground font-medium">
              Step {step} of 3:{" "}
              {step === 1 ? "Select Child" : step === 2 ? "Choose Teacher" : "Pick a Time"}
            </p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-12 rounded-full transition-all duration-500",
                  step >= i ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content with Cinematic Transitions */}
      <div className="flex-1 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {childrenData?.data.map((child: any) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setSelectedChild(child);
                      nextStep();
                    }}
                    className={cn(
                      "p-6 rounded-[2.5rem] border-2 text-start transition-all duration-500 group relative overflow-hidden",
                      selectedChild?.id === child.id
                        ? "border-primary bg-primary/5 shadow-xl scale-[1.02]"
                        : "border-border/40 hover:border-primary/20 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <Avatar className="h-16 w-16 border-4 border-white dark:border-zinc-900 shadow-lg group-hover:scale-110 transition-transform">
                        <AvatarImage src={child.image} />
                        <AvatarFallback className="font-black text-xl">
                          {child.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-black text-xl uppercase tracking-tight">{child.name}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              child.activeRiskLevel === "low" ? "bg-green-500" : "bg-orange-500"
                            )}
                          />
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {child.activeRiskLevel === "low" ? "Stable Status" : "Action Required"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {child.activeRiskLevel !== "low" && (
                      <div className="absolute top-0 right-0 p-4">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-primary/5 border border-primary/10 mb-8">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm font-bold">
                  Showing teachers for{" "}
                  <span className="text-primary font-black uppercase">{selectedChild?.name}</span>
                </p>
              </div>

              {/* This would normally fetch teachers for the selected child's classes */}
              <div className="space-y-4">
                {/* Mock Teacher Selection for MVP */}
                <button
                  onClick={() => {
                    setSelectedTeacher({ id: "t1", name: "Dr. Sarah Wilson" });
                    nextStep();
                  }}
                  className="w-full p-6 rounded-3xl border-2 border-border/40 hover:border-primary/20 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarFallback>SW</AvatarFallback>
                    </Avatar>
                    <div className="text-start">
                      <p className="font-black uppercase tracking-tight">Dr. Sarah Wilson</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Physics & Mathematics
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-16 rounded-[1.5rem] border-2 border-border/40 bg-transparent px-6 font-bold focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    Select Time
                  </label>
                  <select
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-16 rounded-[1.5rem] border-2 border-border/40 bg-transparent px-6 font-bold focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Choose a slot</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 p-8 rounded-[2rem] bg-ai-primary/5 border border-ai-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                  <Sparkles className="h-20 w-24 text-ai-primary" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h4 className="font-black uppercase tracking-widest text-xs text-ai-primary">
                    AI Diagnostic Agenda
                  </h4>
                </div>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Based on your selection, Gemini will automatically analyze{" "}
                  <span className="text-foreground font-black">{selectedChild?.name}'s</span> recent
                  performance and draft a diagnostic meeting agenda for{" "}
                  <span className="text-foreground font-black">{selectedTeacher?.name}</span> to
                  review.
                </p>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="p-6 rounded-[2.5rem] bg-primary/10 text-primary animate-pulse">
                <CheckCircle2 className="h-16 w-16" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black uppercase tracking-tight">Request Sent!</h3>
                <p className="text-muted-foreground font-medium max-w-sm">
                  Your meeting request has been delivered to {selectedTeacher?.name}. You will be
                  notified once it is confirmed.
                </p>
              </div>
              <Button
                onClick={() => setStep(1)}
                className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest"
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      {step < 4 && (
        <div className="p-10 border-t border-border/40 flex justify-between items-center bg-muted/20">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || isSubmitting}
            className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {step === 3 ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || isSubmitting}
              className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Request Meeting
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={step === 1 && !selectedChild}
              className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
