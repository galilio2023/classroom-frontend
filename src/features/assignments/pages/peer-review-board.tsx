import React, { useState } from "react";
import { useList } from "@refinedev/core";
import {
  Users,
  CheckCircle2,
  Clock,
  // //   ArrowRight,
  Loader2,
  Star,
  FileText,
  AlertCircle,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PeerReview } from "@/types";
import { PeerReviewForm } from "@/features/assignments/components/peer-review-form";
import {} from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";

const PeerReviewBoard = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  usePageTitle("Peer Review Board");

  const [selectedReviewId, setSelectedReviewId] = useState<string | number | null>(null);

  const { result: data, query } = useList<PeerReview>({
    resource: "peer-reviews",
    pagination: { mode: "off" },
  });

  const isLoading = query.isLoading;
  const refetch = query.refetch;

  const reviews = data?.data || [];
  const selectedReview = reviews.find((r: PeerReview) => r.id === selectedReviewId);

  const pendingCount = reviews.filter((r: PeerReview) => !r.feedback).length;
  const completedCount = reviews.filter((r: PeerReview) => !!r.feedback).length;

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="container-center section-wrapper !pt-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-start">
        <div className="space-y-4">
          <Breadcrumb />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">
            <Users className="h-3.5 w-3.5" />
            Peer Collaboration
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.85] text-gradient text-balance">
            Peer Review <span className="text-primary/30 text-balance">Board</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl text-balance">
            Evaluate your classmates' work, provide constructive feedback, and earn XP. Helping
            others is the best way to master a subject.
          </p>
        </div>

        <div className="flex gap-4">
          <Card className="bg-primary/5 border-primary/10 px-6 py-3 rounded-2xl flex flex-col items-center justify-center shadow-sm min-w-[120px]">
            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
              Pending
            </span>
            <span className="text-2xl font-black text-primary">{pendingCount}</span>
          </Card>
          <Card className="bg-green-500/5 border-green-500/10 px-6 py-3 rounded-2xl flex flex-col items-center justify-center shadow-sm min-w-[120px]">
            <span className="text-[9px] font-black text-green-600/60 uppercase tracking-widest">
              Done
            </span>
            <span className="text-2xl font-black text-green-600">{completedCount}</span>
          </Card>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Task List */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Your Assignments
          </h2>
          <div className="grid gap-4">
            {reviews.map((review: PeerReview) => {
              const isCompleted = !!review.feedback;
              const isSelected = selectedReviewId === review.id;

              return (
                <motion.div
                  key={review.id}
                  whileHover={{ x: isAr ? -4 : 4 }}
                  onClick={() => setSelectedReviewId(review.id)}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-300 rounded-[2rem] border-2 border-transparent hover:border-primary/20 group overflow-hidden",
                      isSelected ? "border-primary/40 bg-primary/5 shadow-lg" : "bg-card/50",
                      isCompleted && !isSelected ? "opacity-60" : ""
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            "p-2.5 rounded-xl",
                            isCompleted
                              ? "bg-green-500/10 text-green-600"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] uppercase font-black px-2 py-0.5 rounded-full",
                            isCompleted
                              ? "text-green-600 border-green-500/20"
                              : "text-primary border-primary/20"
                          )}
                        >
                          {isCompleted ? "Completed" : "Action Required"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-start">
                        <h3 className="font-black text-sm truncate uppercase tracking-tight">
                          {review.assignment?.title || "Untitled Assignment"}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Classmate Review
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {reviews.length === 0 && (
              <div className="p-12 text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border/40">
                <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  No reviews assigned
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Review Workspace */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedReview ? (
              <motion.div
                key={selectedReview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Submission Content Card */}
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden">
                  <CardHeader className="bg-primary/5 p-8 border-b border-border/40 flex flex-row items-center justify-between">
                    <div className="text-start">
                      <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Submission Content
                      </CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">
                        Read carefully before grading
                      </CardDescription>
                    </div>
                    {selectedReview.submission?.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-10 px-4 font-black uppercase text-[10px] gap-2 shadow-sm"
                        asChild
                      >
                        <a
                          href={selectedReview.submission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download Attachment
                        </a>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-10 text-start">
                    <div className="bg-muted/10 rounded-3xl p-8 border leading-relaxed text-base font-medium whitespace-pre-wrap italic">
                      {selectedReview.submission?.content || "No text content provided."}
                    </div>
                  </CardContent>
                </Card>

                {/* Form Section */}
                <div className="text-start space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20">
                      <Star className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Your Evaluation</h3>
                  </div>
                  {selectedReview.assignment && (
                    <PeerReviewForm
                      review={selectedReview}
                      assignment={selectedReview.assignment}
                      onSuccess={() => {
                        refetch();
                        // Reset selection after a short delay
                        setTimeout(() => setSelectedReviewId(null), 1000);
                      }}
                    />
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center gap-6 bg-muted/5 rounded-[3rem] border-4 border-dashed border-border/20">
                <div className="p-6 rounded-[2.5rem] bg-primary/5 text-primary/20">
                  <BrainCircuit className="h-20 w-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight opacity-40">
                    Select a Task
                  </h3>
                  <p className="text-muted-foreground font-medium max-w-xs uppercase text-[10px] tracking-widest">
                    Pick an assignment from the left to start your evaluation.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PeerReviewBoard;
