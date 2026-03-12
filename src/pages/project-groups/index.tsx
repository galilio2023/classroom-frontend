import React, { useState } from "react";
import { useList, useGetIdentity, useNavigation, useDelete, useCustomMutation } from "@refinedev/core";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Plus, Users, Trash2, Edit, UserPlus, Loader2, Eye } from "lucide-react";
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

const ProjectGroupsPage = () => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const { data: identity } = useGetIdentity<User>();
    const { show } = useNavigation();
    const [isCreateOpen, setCreateOpen] = useState(false);
    
    // Form States
    const [groupName, setGroupName] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("");

    // --- DATA FETCHING ---
    // 1. Fetch Groups
    const { result: groupsResult, query: { isLoading: isLoadingGroups, refetch: refetchGroups } } = useList({
        resource: "project-groups",
    });

    // 2. Fetch Classes (for the dropdown)
    const { result: classesResult } = useList({
        resource: "classes",
        pagination: { mode: "off" },
        queryOptions: { enabled: isCreateOpen } // Only fetch when dialog opens
    });

    // --- MUTATIONS ---
    const { mutate: createGroup, mutation: createMutation } = useCustomMutation<any>();
    const isCreating = createMutation.isPending;
    const { mutate: deleteGroup } = useDelete();

    const handleCreate = () => {
        if (!groupName || !selectedClassId) {
            toast.error(t("projectGroups.toasts.fillFields"));
            return;
        }

        createGroup({
            url: "/project-groups",
            method: "post",
            values: {
                name: groupName,
                classId: Number(selectedClassId),
                memberIds: []
            }
        }, {
            onSuccess: () => {
                toast.success(t("projectGroups.toasts.created"));
                setCreateOpen(false);
                setGroupName("");
                setSelectedClassId("");
                refetchGroups();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to create group");
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm(t("projectGroups.toasts.deleteConfirm"))) {
            deleteGroup({
                resource: "project-groups",
                id,
            }, {
                onSuccess: () => {
                    toast.success(t("projectGroups.toasts.deleted"));
                    refetchGroups();
                },
                onError: () => toast.error("Failed to delete group")
            });
        }
    };

    const groups = groupsResult?.data || [];
    const classesList = classesResult?.data || [];
    const isTeacherOrAdmin = identity?.role === 'teacher' || identity?.role === 'admin';

    return (
        <div className="container mx-auto py-6 text-start">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("projectGroups.title")}</h1>
                    <p className="text-muted-foreground">{t("projectGroups.description")}</p>
                </div>
                {isTeacherOrAdmin && (
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> {t("projectGroups.createGroup")}
                    </Button>
                )}
            </div>

            {isLoadingGroups ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
                </div>
            ) : groups.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={t("projectGroups.noGroups")}
                    description={isTeacherOrAdmin 
                        ? t("projectGroups.noGroupsDescTeacher") 
                        : t("projectGroups.noGroupsDescStudent")}
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group: any) => (
                        <Card key={group.id} className="flex flex-col overflow-hidden border-none shadow-md hover:shadow-xl transition-all">
                            <CardHeader className="flex-row justify-between items-start bg-card/50 pb-2">
                                <div>
                                    <CardTitle className="text-lg font-bold">{group.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">
                                        {group.class?.name || t("projectGroups.unknownClass")}
                                    </p>
                                </div>
                                {isTeacherOrAdmin && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(group.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t("projectGroups.members")}</span>
                                        <span className="font-medium">{new Intl.NumberFormat(i18n.language).format(group.members?.length || 0)}</span>
                                    </div>
                                    
                                    <div className={cn("flex overflow-hidden py-1", isAr ? "-space-x-reverse space-x-2" : "-space-x-2")}>
                                        {group.members?.length > 0 ? (
                                            <>
                                                {group.members.slice(0, 5).map((member: any) => (
                                                    <Avatar key={member.student.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                                        <AvatarImage src={member.student.image} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                            {member.student.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {group.members.length > 5 && (
                                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
                                                        +{new Intl.NumberFormat(i18n.language).format(group.members.length - 5)}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">{t("projectGroups.noMembers")}</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-3 bg-muted/30 border-t flex justify-end">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full text-xs font-medium h-8 gap-2"
                                    onClick={() => show("project-groups", group.id)}
                                >
                                    <Eye className="h-3 w-3" /> {t("buttons.viewDetailsAndMembers")}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Group Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="text-start">
                    <DialogHeader className="text-start">
                        <DialogTitle>{t("projectGroups.createDialogTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("projectGroups.createDialogDesc")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("projectGroups.groupName")}</Label>
                            <Input 
                                id="name" 
                                placeholder={t("projectGroups.groupNamePlaceholder")} 
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("projectGroups.classLabel")}</Label>
                            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("projectGroups.selectClass")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {classesList.map((cls: any) => (
                                        <SelectItem key={cls.id} value={String(cls.id)}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("buttons.cancel")}</Button>
                        <Button onClick={handleCreate} disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("buttons.create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectGroupsPage;
