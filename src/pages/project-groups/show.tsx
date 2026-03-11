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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus, Trash2, Users, Loader2, ChevronsUpDown, Check, UserPlus, Presentation } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Whiteboard } from "@/components/classes/whiteboard";

const ShowProjectGroup = () => {
  const { id } = useParams();
  const { data: identity } = useGetIdentity<User>();
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("members");

  const { result: groupResult, query: { isLoading, refetch } } = useShow({
    resource: "project-groups",
    id,
  });

  const group = groupResult?.data as any;

  // Fetch all students enrolled in the group's class to populate the "Add Member" dialog
  const { result: classStudentsResult } = useList({
    resource: "enrollments",
    filters: [{ field: "classId", operator: "eq", value: group?.class.id }],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!group?.class.id },
  });

  const { mutate: manageMembers, mutation: manageMutation } = useCustomMutation();
  const isManagingMembers = manageMutation.isPending;

  const handleAddMembers = () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to add.");
      return;
    }

    manageMembers({
      url: `/project-groups/${id}/members`,
      method: "patch",
      values: { add: selectedStudents },
    }, {
      onSuccess: () => {
        toast.success("Members added successfully!");
        setAddMemberOpen(false);
        setSelectedStudents([]);
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to add members.");
      },
    });
  };

  const handleRemoveMember = (studentId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
        manageMembers({
            url: `/project-groups/${id}/members`,
            method: "patch",
            values: { remove: [studentId] },
        }, {
            onSuccess: () => {
                toast.success("Member removed.");
                refetch();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to remove member.");
            },
        });
    }
  };

  const enrolledStudents = classStudentsResult?.data.map((e: any) => e.student) || [];
  const groupMemberIds = new Set(group?.members.map((m: any) => m.student.id) || []);
  const availableStudents = enrolledStudents.filter((s: any) => !groupMemberIds.has(s.id));

  const isTeacherOrAdmin = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading group details...</div>;
  }

  if (!group) {
    return <div className="container mx-auto py-6">Group not found.</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">
            Project group for class: <Link to={`/classes/show/${group.class.id}`} className="text-primary hover:underline">{group.class.name}</Link>
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Members
          </TabsTrigger>
          <TabsTrigger value="whiteboard" className="flex items-center gap-2">
            <Presentation className="h-4 w-4" /> Group Whiteboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Group Members</CardTitle>
                {isTeacherOrAdmin && (
                  <Button onClick={() => setAddMemberOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" /> Add Members
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.members.map((member: any) => (
                  <div key={member.student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.student.image} />
                        <AvatarFallback>{member.student.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.student.name}</p>
                        <p className="text-sm text-muted-foreground">{member.student.email}</p>
                      </div>
                    </div>
                    {isTeacherOrAdmin && (
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveMember(member.student.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whiteboard" className="mt-4">
           <div className="h-[700px]">
             <Whiteboard 
                classId={String(group.class.id)} 
                roomId={`group-${group.id}`} 
             />
           </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members to {group.name}</DialogTitle>
            <DialogDescription>Select students from the class roster to add to this group.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selectedStudents.length > 0 ? `${selectedStudents.length} student(s) selected` : "Select students..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search students..." />
                  <CommandList>
                    <CommandEmpty>No students found.</CommandEmpty>
                    <CommandGroup>
                      {availableStudents.map((student: any) => (
                        <CommandItem
                          key={student.id}
                          value={student.name}
                          onSelect={() => {
                            setSelectedStudents(prev => 
                              prev.includes(student.id) 
                                ? prev.filter(id => id !== student.id) 
                                : [...prev, student.id]
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStudents.includes(student.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {student.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMembers} disabled={isManagingMembers}>
              {isManagingMembers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShowProjectGroup;
