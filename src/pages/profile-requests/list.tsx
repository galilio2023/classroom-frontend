import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, MessageSquare, Loader2 } from "lucide-react";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import { ProfileChangeRequest } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ProfileRequestsList = () => {
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { mutate: approve, isLoading: isApproving } = useCustomMutation();
  const { mutate: reject, isLoading: isRejecting } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleApprove = (id: number) => {
    approve({
        url: `/profile-requests/${id}/approve`,
        method: "post",
        values: {},
    }, {
        onSuccess: () => {
            toast.success("Changes approved and applied");
            invalidate({
                resource: "profile-requests",
                invalidates: ["list"],
            });
        }
    });
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    
    reject({
        url: `/profile-requests/${rejectTarget}/reject`,
        method: "post",
        values: { notes: rejectReason || "Changes rejected by administrator" },
    }, {
        onSuccess: () => {
            toast.success("Changes rejected");
            setRejectTarget(null);
            setRejectReason("");
            invalidate({
                resource: "profile-requests",
                invalidates: ["list"],
            });
        }
    });
  };

  const columns = useMemo<ColumnDef<ProfileChangeRequest>[]>(
    () => [
      {
        id: "user",
        header: "User",
        accessorKey: "user",
        cell: ({ getValue }) => {
          const user = getValue<ProfileChangeRequest["user"]>();
          if (!user) return null;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-[10px] text-muted-foreground">{user.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "changes",
        header: "Requested Changes",
        cell: ({ row }) => {
            const oldData = row.original.oldData || {};
            const newData = row.original.newData || {};
            const changedKeys = Object.keys(newData).filter(k => newData[k] !== oldData[k]);

            return (
                <div className="flex flex-col gap-1">
                    {changedKeys.map(key => (
                        <div key={key} className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="h-4 px-1 uppercase font-black">{key}</Badge>
                            <span className="text-muted-foreground line-through truncate max-w-[80px]">{String(oldData[key] || "empty")}</span>
                            <ArrowRight className="h-2 w-2" />
                            <span className="font-bold text-primary truncate max-w-[80px]">{String(newData[key])}</span>
                        </div>
                    ))}
                </div>
            );
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
            const status = getValue<string>();
            return (
                <Badge 
                    variant={status === "pending" ? "secondary" : status === "approved" ? "default" : "destructive"}
                    className="capitalize"
                >
                    {status}
                </Badge>
            );
        }
      },
      {
        accessorKey: "createdAt",
        header: "Requested On",
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            if (row.original.status !== "pending") return null;
            return (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(row.original.id)}
                        disabled={isApproving}
                    >
                        {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRejectTarget(row.original.id)}
                        disabled={isRejecting}
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
      },
    ],
    [isApproving, isRejecting]
  );

  const table = useTable({
    columns,
    refineCoreProps: {
        resource: "profile-requests",
    }
  });

  return (
    <>
        <ListView>
            <ListViewHeader 
                title="Profile Change Requests" 
            />
            <DataTable table={table} />
        </ListView>

        <Dialog open={rejectTarget !== null} onOpenChange={() => setRejectTarget(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-destructive" />
                        Reject Profile Request
                    </DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting these changes. This will be visible to the user.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        placeholder="e.g. Invalid document provided, or incorrect information."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleReject}
                        disabled={isRejecting}
                    >
                        {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                        Reject Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
};

export default ProfileRequestsList;
