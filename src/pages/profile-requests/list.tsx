import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, MessageSquare, Loader2, FileText, ExternalLink, Eye } from "lucide-react";
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
import { cn } from "@/lib/utils";

const ProfileRequestsList = () => {
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { mutate: approve, mutation: approveMutation } = useCustomMutation();
  const { mutate: reject, mutation: rejectMutation } = useCustomMutation();
  const invalidate = useInvalidate();

  const isApproving = approveMutation.isPending;
  const isRejecting = rejectMutation.isPending;

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
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border-2 border-primary/10">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">{user.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{user.email}</span>
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
                <div className="flex flex-col gap-2">
                    {changedKeys.map(key => {
                        const isDoc = key === "verificationDocumentUrl";
                        return (
                            <div key={key} className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 px-1.5 uppercase font-black text-[8px] tracking-tighter">
                                    {key.replace("Url", "").replace(/([A-Z])/g, ' $1')}
                                </Badge>
                                {isDoc ? (
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="h-auto p-0 text-[10px] font-bold gap-1"
                                        onClick={() => setPreviewUrl(String(newData[key]))}
                                    >
                                        <FileText className="h-3 w-3" />
                                        View Document
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium">
                                        <span className="text-muted-foreground line-through truncate max-w-[100px]">{String(oldData[key] || "empty")}</span>
                                        <ArrowRight className="h-2.5 w-2.5 text-primary/40" />
                                        <span className="font-bold text-primary truncate max-w-[100px]">{String(newData[key])}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
                    className={cn(
                        "capitalize text-[10px] font-black tracking-widest px-2 h-5",
                        status === "pending" && "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}
                >
                    {status}
                </Badge>
            );
        }
      },
      {
        accessorKey: "createdAt",
        header: "Requested On",
        cell: ({ getValue }) => (
            <div className="flex flex-col">
                <span className="text-xs font-bold">{new Date(getValue<string>()).toLocaleDateString()}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(getValue<string>()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        ),
      },
      {
        id: "actions",
        header: () => <p className="text-right pr-4">Actions</p>,
        cell: ({ row }) => {
            if (row.original.status !== "pending") return null;
            return (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-bold text-green-600 border-green-500/20 hover:bg-green-500/5 gap-1.5"
                        onClick={() => handleApprove(row.original.id)}
                        disabled={isApproving}
                    >
                        {isApproving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        Approve
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-bold text-destructive border-destructive/20 hover:bg-destructive/5 gap-1.5"
                        onClick={() => setRejectTarget(row.original.id)}
                        disabled={isRejecting}
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
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
        pagination: { pageSize: 10 },
        sorters: { initial: [{ field: "createdAt", order: "desc" }] },
        meta: { populate: ["user"] }
    }
  });

  return (
    <>
        <ListView>
            <ListViewHeader 
                title="Pending Approvals" 
            />
            <DataTable table={table} />
        </ListView>

        {/* Document Preview Dialog */}
        <Dialog open={previewUrl !== null} onOpenChange={() => setPreviewUrl(null)}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Document Preview
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 bg-muted rounded-xl overflow-hidden border mt-4">
                    {previewUrl?.endsWith(".pdf") ? (
                        <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <img src={previewUrl || ""} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                        </div>
                    )}
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setPreviewUrl(null)}>Close Preview</Button>
                    <Button asChild>
                        <a href={previewUrl || ""} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in New Tab
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={rejectTarget !== null} onOpenChange={() => setRejectTarget(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-destructive" />
                        Reject Request
                    </DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting these changes. This will be sent as a notification to the user.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        placeholder="e.g. The uploaded document is blurry or invalid. Please re-upload a clear copy of your teaching certificate."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[120px] rounded-xl focus-visible:ring-destructive/30"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleReject}
                        disabled={isRejecting || !rejectReason.trim()}
                        className="font-bold"
                    >
                        {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                        Confirm Rejection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
};

export default ProfileRequestsList;
