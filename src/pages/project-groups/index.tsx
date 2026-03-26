import React, { useState } from "react";
import {
  useList,
  useGetIdentity,
  useNavigation,
  useDelete,
  useCustomMutation,
} from "@refinedev/core";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  Plus,
  Users,
  Trash2,
  Edit,
  UserPlus,
  Loader2,
  Eye,
  Sparkles,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

const ProjectGroupsPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { data: identity } = useGetIdentity<User>();
  const { show } = useNavigation();
  const [isCreateOpen, setCreateOpen] = useState(false);

  // Form States
  const [groupName, setGroupName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // --- DATA FETCHING ---
  // 1. Fetch Groups
  const { query: groupsQueryResult } = useList({
    resource: "project-groups",
    pagination: { pageSize: 50, mode: "server" },
    meta: {
      populate: ["members", "members.student", "class"],
    },
  });
  const {
    data: groupsResult,
    isLoading: isLoadingGroups,
    refetch: refetchGroups,
  } = groupsQueryResult;

  // 2. Fetch Classes (for the dropdown)
  const { query: classesQueryResult } = useList({
    resource: "classes",
    pagination: { mode: "off" },
    queryOptions: { enabled: isCreateOpen }, // Only fetch when dialog opens
  });
  const { data: classesResult } = classesQueryResult;

  // --- MUTATIONS ---
  const { mutate: createGroup, mutation: createMutation } =
    useCustomMutation<any>();
  const isCreating = createMutation.isPending;
  const { mutate: deleteGroup } = useDelete();

  const handleCreate = () => {
    if (!groupName || !selectedClassId) {
      toast.error(t("projectGroups.toasts.fillFields"));
      return;
    }

    createGroup(
      {
        url: "/project-groups",
        method: "post",
        values: {
          name: groupName,
          classId: Number(selectedClassId),
          memberIds: [],
        },
      },
      {
        onSuccess: () => {
          toast.success(t("projectGroups.toasts.created"));
          setCreateOpen(false);
          setGroupName("");
          setSelectedClassId("");
          refetchGroups();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to create group",
          );
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (confirm(t("projectGroups.toasts.deleteConfirm"))) {
      deleteGroup(
        {
          resource: "project-groups",
          id,
        },
        {
          onSuccess: () => {
            toast.success(t("projectGroups.toasts.deleted"));
            refetchGroups();
          },
          onError: () => toast.error("Failed to delete group"),
        },
      );
    }
  };

  const groups = groupsResult?.data || [];
  const classesList = classesResult?.data || [];
  const isTeacherOrAdmin =
    identity?.role === "teacher" || identity?.role === "admin";

  return (
    <div className="space-y-10 md:space-y-16 pb-20 max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2"
      >
        <div className="space-y-4 flex-1">
          <Breadcrumb />
          <div className="space-y-1 text-start">
            <h1 className="page-title mb-0 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                <Users className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              {t("projectGroups.title")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl text-balance">
              {t("projectGroups.description")}
            </p>
          </div>
        </div>
        {isTeacherOrAdmin && (
          <Button
            onClick={() => setCreateOpen(true)}
            size="lg"
            className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
          >
            <Plus className="h-5 w-5" /> {t("projectGroups.createGroup")}
          </Button>
        )}
      </motion.div>

      {isLoadingGroups ? (
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2">
          {[1, 2, 3, 4, 5, 6].map((i: any) => (
            <Card
              key={i}
              className="h-64 rounded-4xl bg-muted/20 animate-pulse border-border/20 shadow-sm"
            />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40 mx-2">
          <EmptyState
            icon={Users}
            title={t("projectGroups.noGroups")}
            description={
              isTeacherOrAdmin
                ? t("projectGroups.noGroupsDescTeacher")
                : t("projectGroups.noGroupsDescStudent")
            }
            className="border-none bg-transparent min-h-0"
            action={
              isTeacherOrAdmin
                ? {
                    label: t("projectGroups.createGroup"),
                    onClick: () => setCreateOpen(true),
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2">
          <AnimatePresence mode="popLayout">
            {groups.map((group: any, index: any) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="flex flex-col overflow-hidden border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-4xl bg-card/50 backdrop-blur-xl group hover:border-primary/20">
                  <CardHeader className="p-6 md:p-8 pb-4 flex-row justify-between items-start bg-primary/5 border-b border-border/40">
                    <div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                        {group.name}
                      </CardTitle>
                      <p className="text-sm md:text-base text-muted-foreground/70 font-medium mt-1">
                        {group.class?.name || t("projectGroups.unknownClass")}
                      </p>
                    </div>
                    {isTeacherOrAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            show("project-groups", group.id);
                          }}
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(group.id);
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 p-6 md:p-8 pt-4 space-y-6">
                    <div className="flex items-center justify-between text-sm md:text-base">
                      <span className="text-muted-foreground font-medium">
                        {t("projectGroups.members")}
                      </span>
                      <span className="font-black text-foreground">
                        {new Intl.NumberFormat(i18n.language).format(
                          group.members?.length || 0,
                        )}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "flex overflow-hidden py-1",
                        isAr ? "-space-x-reverse space-x-2" : "-space-x-2",
                      )}
                    >
                      {group.members?.length > 0 ? (
                        <>
                          {group.members.slice(0, 5).map((member: any) => (
                            <Avatar
                              key={member.student.id}
                              className="inline-block h-10 w-10 rounded-full ring-2 ring-background shadow-sm"
                            >
                              <AvatarImage src={member.student.image} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-black">
                                {member.student.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {group.members.length > 5 && (
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted/50 text-sm font-black text-muted-foreground ring-2 ring-background shadow-sm">
                              +
                              {new Intl.NumberFormat(i18n.language).format(
                                group.members.length - 5,
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          {t("projectGroups.noMembers")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-4 md:p-6 bg-primary/2 border-t border-border/40 flex justify-end">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 text-primary shadow-sm"
                      onClick={() => show("project-groups", group.id)}
                    >
                      <Eye className="h-4 w-4" />{" "}
                      {t("buttons.viewDetailsAndMembers")}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg p-0 overflow-hidden text-start">
          <div className="p-8 md:p-12 space-y-8">
            <DialogHeader className="space-y-4 text-start">
              <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                <Users className="h-10 w-10" />
              </div>
              <div className="space-y-2 text-center">
                <DialogTitle className="text-3xl font-black tracking-tight">
                  {t("projectGroups.createDialogTitle")}
                </DialogTitle>
                <DialogDescription className="font-medium text-base text-muted-foreground">
                  {t("projectGroups.createDialogDesc")}
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="name"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2"
                >
                  {t("projectGroups.groupName")}
                </Label>
                <Input
                  id="name"
                  placeholder={t("projectGroups.groupNamePlaceholder")}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 text-lg font-black"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                  {t("projectGroups.classLabel")}
                </Label>
                <Select
                  onValueChange={setSelectedClassId}
                  value={selectedClassId}
                >
                  <SelectTrigger className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 text-lg font-black">
                    <SelectValue placeholder={t("projectGroups.selectClass")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-2 bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50">
                    {classesList.map((cls: any) => (
                      <SelectItem
                        key={cls.id}
                        value={String(cls.id)}
                        className="rounded-xl py-3 cursor-pointer"
                      >
                        <span className="font-bold">{cls.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8 order-2 sm:order-1"
                onClick={() => setCreateOpen(false)}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                size="lg"
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20 order-1 sm:order-2"
              >
                {isCreating ? (
                  <Loader2 className="me-3 h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5 me-3" />
                )}
                {t("buttons.create")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectGroupsPage;
