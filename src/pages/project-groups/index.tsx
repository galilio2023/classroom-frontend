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

const ProjectGroupsPage = () => {
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
            toast.error("Please fill in all fields");
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
                toast.success("Group created successfully");
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
        if (confirm("Are you sure you want to delete this group?")) {
            deleteGroup({
                resource: "project-groups",
                id,
            }, {
                onSuccess: () => {
                    toast.success("Group deleted");
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
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Groups</h1>
                    <p className="text-muted-foreground">Manage collaborative student teams.</p>
                </div>
                {isTeacherOrAdmin && (
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> Create Group
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
                    title="No Project Groups"
                    description={isTeacherOrAdmin 
                        ? "Create groups to facilitate team-based assignments." 
                        : "You haven't been assigned to any project groups yet."}
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group: any) => (
                        <Card key={group.id} className="flex flex-col overflow-hidden border-none shadow-md hover:shadow-xl transition-all">
                            <CardHeader className="flex-row justify-between items-start bg-card/50 pb-2">
                                <div>
                                    <CardTitle className="text-lg font-bold">{group.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">
                                        {group.class?.name || "Unknown Class"}
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
                                        <span className="text-muted-foreground">Members</span>
                                        <span className="font-medium">{group.members?.length || 0}</span>
                                    </div>
                                    
                                    <div className="flex -space-x-2 overflow-hidden py-1">
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
                                                        +{group.members.length - 5}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">No members assigned</span>
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
                                    <Eye className="h-3 w-3" /> View Details & Members
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Group Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Project Group</DialogTitle>
                        <DialogDescription>
                            Groups are linked to a specific class. You can add members after creating the group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Group Name</Label>
                            <Input 
                                id="name" 
                                placeholder="e.g., Team Alpha, Group 1" 
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Class</Label>
                            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
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
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectGroupsPage;
