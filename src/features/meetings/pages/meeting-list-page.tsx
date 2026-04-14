import React from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { useList, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { MeetingRequestWizard } from "../components/meeting-request-wizard";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {} from // //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuTrigger,
"@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MeetingListPage = () => {
  const { data: identity } = useGetIdentity<any>();
  const isParent = identity?.role === "parent";
  const isTeacher = identity?.role === "teacher";

  const { query: meetingsQuery } = useList({
    resource: "meetings",
  });

  const { data: meetings, isLoading, refetch } = meetingsQuery;

  const { mutate: updateStatus } = useCustomMutation();

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatus(
      {
        url: `meetings/${id}/status`,
        method: "patch",
        values: { status },
      },
      {
        onSuccess: () => refetch(),
      }
    );
  };

  return (
    <div className="container mx-auto py-10 space-y-12">
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/40">
            Meetings
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            {isParent
              ? "Coordinate with your children's educators."
              : "Manage your parental consultations."}
          </p>
        </div>

        {isParent && (
          <div className="flex gap-4">
            {/* The Wizard is usually triggered by a button, but here we can show it in a dialog or drawer if needed. 
                For this cinematic view, let's keep the focus on the list and add a 'New Meeting' button */}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-primary/40" />
              </motion.div>
            </div>
          ) : meetings?.data.length === 0 ? (
            <Card className="rounded-[3rem] border-dashed border-2 p-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-6 rounded-[2rem] bg-muted/50">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase">No Meetings Found</h3>
                <p className="text-muted-foreground font-medium">
                  You don't have any scheduled consultations yet.
                </p>
              </div>
            </Card>
          ) : (
            meetings?.data.map((meeting: any, idx: number) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="group rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-card/50 backdrop-blur-xl">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Date Block */}
                      <div className="flex md:flex-col items-center justify-center gap-2 p-6 rounded-3xl bg-primary/5 min-w-[120px]">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                          {format(new Date(meeting.requestedAt), "MMM")}
                        </span>
                        <span className="text-4xl font-black text-primary">
                          {format(new Date(meeting.requestedAt), "dd")}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                          <Clock className="h-3 w-3" />
                          {format(new Date(meeting.requestedAt), "hh:mm a")}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                              <AvatarImage
                                src={isParent ? meeting.teacher.image : meeting.parent.image}
                              />
                              <AvatarFallback>
                                {(isParent ? meeting.teacher.name : meeting.parent.name).substring(
                                  0,
                                  2
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-start">
                              <p className="font-black text-lg uppercase tracking-tight">
                                {isParent ? meeting.teacher.name : meeting.parent.name}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {isParent ? "Educator" : "Parent"} • Student:{" "}
                                <span className="text-foreground">{meeting.student.name}</span>
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              "rounded-full px-4 py-1 font-black uppercase tracking-widest text-[9px] border-none",
                              meeting.status === "approved"
                                ? "bg-green-500/10 text-green-500"
                                : meeting.status === "rejected"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-orange-500/10 text-orange-500"
                            )}
                          >
                            {meeting.status}
                          </Badge>
                        </div>

                        {/* AI Agenda Section */}
                        {(meeting.agenda || meeting.aiSuggestedAgenda) && (
                          <div className="p-6 rounded-3xl bg-muted/30 border border-border/40 space-y-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Meeting Agenda
                              </span>
                              {meeting.aiSuggestedAgenda && !meeting.agenda && (
                                <Badge
                                  variant="outline"
                                  className="h-5 px-2 gap-1 rounded-md text-[8px] bg-ai-primary/5 text-ai-primary border-ai-primary/20"
                                >
                                  <Sparkles className="h-2 w-2" /> AI Drafted
                                </Badge>
                              )}
                            </div>
                            <MarkdownRenderer
                              content={meeting.agenda || meeting.aiSuggestedAgenda}
                              className="text-sm font-medium leading-relaxed"
                            />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          {meeting.status === "approved" && meeting.meetingUrl && (
                            <Button className="rounded-xl h-11 px-6 font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                              <Video className="h-4 w-4" />
                              Join Meeting
                            </Button>
                          )}

                          {isTeacher && meeting.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleStatusUpdate(meeting.id, "approved")}
                                className="rounded-xl h-11 px-6 font-black uppercase tracking-widest gap-2 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleStatusUpdate(meeting.id, "rejected")}
                                className="rounded-xl h-11 px-6 font-black uppercase tracking-widest gap-2 text-destructive hover:bg-destructive/5"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline
                              </Button>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-8">
          {isParent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 px-4">
                New Request
              </h3>
              <MeetingRequestWizard />
            </motion.div>
          )}

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-linear-to-br from-primary/10 to-transparent p-8 space-y-6">
            <div className="space-y-2">
              <h4 className="font-black uppercase tracking-tight text-xl">Pro Tip</h4>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Gemini automatically analyzes your child's data to suggest discussion points. Look
                for the <Sparkles className="h-3 w-3 inline text-ai-primary" /> icon to see
                AI-driven insights.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeetingListPage;
