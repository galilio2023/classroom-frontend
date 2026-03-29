import React, { useState } from "react";
import { useShow, useList, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, UserRole } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Plus,
  Trash2,
  Users,
  Loader2,
  ChevronsUpDown,
  Check,
  UserPlus,
  Presentation,
  Sparkles,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Whiteboard } from "@/components/classes/whiteboard";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Label } from "@/components/ui/label";

const ShowProjectGroup = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { id } = useParams();
  const { data: identity } = useGetIdentity<User>();
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("members");

  const { query } = useShow({
    resource: "project-groups",
    id,
    meta: {
      populate: ["members", "members.student", "class"],
    },
  });

  const { data: groupResult, isLoading, refetch } = query;
  const group = groupResult?.data as any;

  const { query: classStudentsQuery } = useList({
    resource: "enrollments",
    filters: [{ field: "classId", operator: "eq", value: group?.class.id }],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!group?.class.id },
  });

  const enrolledStudents = classStudentsQuery.data?.data.map((e: any) => e.student) || [];
  const groupMemberIds = new Set(group?.members.map((m: any) => m.student.id) || []);
  const availableStudents = enrolledStudents.filter((s: any) => !groupMemberIds.has(s.id));

  const isTeacherOrAdmin = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

  const { mutate: addMembers, mutation: addMutation } = useCustomMutation();
  const { mutate: removeMember, mutation: removeMutation } = useCustomMutation();
  const isAdding = addMutation.isPending;
  const isRemoving = removeMutation.isPending;
  const isManagingMembers = isAdding || isRemoving;

  const handleAddMembers = () => {
    if (selectedStudents.length === 0) return;
    addMembers(
      {
        url: `/project-groups/${id}/members`,
        method: "post",
        values: { studentIds: selectedStudents },
      },
      {
        onSuccess: () => {
          toast.success(t("projectGroups.toasts.membersAdded"));
          setAddMemberOpen(false);
          setSelectedStudents([]);
          void refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || t("common.error"));
        },
      }
    );
  };

  const handleRemoveMember = (studentId: string) => {
    removeMember(
      {
        url: `/project-groups/${id}/members/${studentId}`,
        method: "delete",
        values: {},
      },
      {
        onSuccess: () => {
          toast.success(t("projectGroups.toasts.memberRemoved"));
          void refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || t("common.error"));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="absolute inset-[-20px] rounded-full bg-primary/5 animate-ping duration-[3000ms]" />
          <Loader2 className="h-20 w-20 animate-spin text-primary/10 stroke-[1]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary/30" />
          </div>
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
            {t("profile.loading")}
          </h2>
          <p className="text-xs font-medium text-muted-foreground/60 italic">
            Assembling project group details...
          </p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto py-32 text-center space-y-8">
        <div className="p-8 rounded-[2.5rem] bg-destructive/5 text-destructive w-fit mx-auto border border-destructive/10">
          <Users className="h-20 w-20 opacity-20" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight">
            {t("projectGroups.show.noStudentsFound")}
          </h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg">
            {t("projectGroups.show.noStudentsFound")}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[10px]"
        >
          <Link to="/project-groups">{t("buttons.goBack")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-16 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 md:space-y-6 text-start px-2"
      >
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
              <Users className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="page-title mb-0">{group.name}</h1>
              <p className="text-muted-foreground font-medium max-w-xl text-balance">
                {t("projectGroups.show.projectGroupFor")}{" "}
                <Link
                  to={`/classes/show/${group.class.id}`}
                  className="text-primary hover:underline font-bold"
                >
                  {group.class.name}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-8 md:space-y-12"
      >
        <div className="sticky top-20 z-40">
          <div className="rounded-3xl border border-border/40 bg-background/40 backdrop-blur-3xl p-1.5 shadow-2xl shadow-black/5 mx-2">
            <TabsList className="grid w-full grid-cols-2 h-12 md:h-14 bg-muted/20 gap-1 rounded-[1.25rem]">
              <TabsTrigger
                value="members"
                className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 md:gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
              >
                <Users className="h-4 w-4 md:h-5 md:w-5" /> {t("projectGroups.members")}
              </TabsTrigger>
              <TabsTrigger
                value="whiteboard"
                className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 md:gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
              >
                <Presentation className="h-4 w-4 md:h-5 md:w-5" />{" "}
                {t("projectGroups.show.whiteboard")}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="members" className="mt-0 px-2">
          <Card className="border-border/40 shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 md:p-10 pb-4 md:pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 border-b border-border/40">
              <CardTitle className="text-xl md:text-2xl font-black tracking-tight">
                {t("projectGroups.show.groupMembers")}
              </CardTitle>
              {isTeacherOrAdmin && (
                <Button
                  onClick={() => setAddMemberOpen(true)}
                  size="lg"
                  className="rounded-2xl h-12 md:h-14 px-8 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
                >
                  <UserPlus className="h-5 w-5" /> {t("projectGroups.show.addMembers")}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {group.members.map((member: any, index: number) => (
                    <motion.div
                      key={member.student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border border-border/40 bg-background/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-[1.5rem] group/member">
                        <CardContent className="p-6 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-background shadow-sm group-hover/member:scale-105 transition-transform">
                              <AvatarImage src={member.student.image} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">
                                {member.student.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-black text-lg tracking-tight group-hover/member:text-primary transition-colors">
                                {member.student.name}
                              </p>
                              <p className="text-sm text-muted-foreground/70 font-medium">
                                {member.student.email}
                              </p>
                            </div>
                          </div>
                          {isTeacherOrAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 opacity-0 group-hover/member:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMember(member.student.id);
                              }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whiteboard" className="mt-0 px-2">
          <Card className="border-border/40 shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[500px] md:h-[700px]">
                <Whiteboard classId={String(group.class.id)} roomId={`group-${group.id}`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg p-0 overflow-hidden text-start">
          <div className="p-8 md:p-12 space-y-8">
            <DialogHeader className="space-y-4 text-start">
              <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                <UserPlus className="h-10 w-10" />
              </div>
              <div className="space-y-2 text-center">
                <DialogTitle className="text-3xl font-black tracking-tight">
                  {t("projectGroups.show.addMembersTo", { name: group.name })}
                </DialogTitle>
                <DialogDescription className="font-medium text-base text-muted-foreground">
                  {t("projectGroups.show.addMembersDesc")}
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                {t("projectGroups.show.selectStudents")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-14 rounded-2xl bg-muted/30 border-none shadow-inner px-6 text-base font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                  >
                    {selectedStudents.length > 0
                      ? t("projectGroups.show.studentsSelected", {
                          count: selectedStudents.length,
                        })
                      : t("projectGroups.show.selectStudents")}
                    <ChevronsUpDown className="ms-2 h-5 w-5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl shadow-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50">
                  <Command>
                    <CommandInput
                      placeholder={t("common.search")}
                      className="h-12 rounded-xl bg-muted/30 border-none shadow-inner px-6 text-base font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                    />
                    <CommandList className="max-h-60">
                      <CommandEmpty>{t("projectGroups.show.noStudentsFound")}</CommandEmpty>
                      <CommandGroup>
                        {availableStudents.map((student: any) => (
                          <CommandItem
                            key={student.id}
                            value={student.name}
                            onSelect={() => {
                              setSelectedStudents((prev) =>
                                prev.includes(student.id)
                                  ? prev.filter((id) => id !== student.id)
                                  : [...prev, student.id]
                              );
                            }}
                            className="flex items-center gap-3 py-3 cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "h-5 w-5",
                                selectedStudents.includes(student.id)
                                  ? "opacity-100 text-primary"
                                  : "opacity-0"
                              )}
                            />
                            <Avatar className="h-9 w-9 border-2 border-background">
                              <AvatarImage src={student.image} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-black">
                                {student.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-base">{student.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8 order-2 sm:order-1"
                onClick={() => setAddMemberOpen(false)}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                onClick={handleAddMembers}
                disabled={isManagingMembers}
                size="lg"
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20 order-1 sm:order-2"
              >
                {isManagingMembers ? (
                  <Loader2 className="me-3 h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="h-5 w-5 me-3" />
                )}
                {t("buttons.addSelected")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShowProjectGroup;
