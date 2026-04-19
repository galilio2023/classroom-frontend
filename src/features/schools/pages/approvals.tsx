import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  FileQuestion,
  LayoutGrid,
  Library,
} from "lucide-react";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

/**
 * 🏛️ INSTITUTIONAL APPROVALS DASHBOARD
 * Central command for Admins and HoDs to review institutional content.
 * Enforces quality standards for AI and teacher-submitted materials.
 */
const ApprovalsPage = () => {
  const { t } = useTranslation();

  const { query } = useCustom<any[]>({
    url: "/admin/approvals/pending",
    method: "get",
  });

  const { data, isLoading, refetch } = query;

  const { mutate: processApproval, mutation } = useCustomMutation();
  const isProcessing = mutation.isPending;

  const handleAction = (entityType: string, entityId: string, status: "approved" | "rejected") => {
    processApproval(
      {
        url: "/admin/approvals/process",
        method: "post",
        values: { entityType, entityId, status },
      },
      {
        onSuccess: () => {
          toast.success(
            status === "approved"
              ? t("resources.admin-approvals.success")
              : t("resources.admin-approvals.rejected")
          );
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to process approval.");
        },
      }
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <FileQuestion className="h-4 w-4" />;
      case "module":
        return <LayoutGrid className="h-4 w-4" />;
      case "resource":
        return <Library className="h-4 w-4" />;
      default:
        return <ShieldCheck className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8 text-start">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            {t("resources.admin-approvals.title")}
          </h1>
          <p className="text-slate-500 mt-1">{t("resources.admin-approvals.description")}</p>
        </div>
      </div>

      <Card className="rounded-[2rem] border-none shadow-xl bg-card/50 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Loading pending items...
              </p>
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black">{t("resources.admin-approvals.empty")}</h3>
                <p className="text-sm text-muted-foreground">All content is properly vetted.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">
                      {t("resources.admin-approvals.entity")}
                    </TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">
                      Title
                    </TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">
                      {t("resources.admin-approvals.class")}
                    </TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">
                      Date
                    </TableHead>
                    <TableHead className="px-8 text-end font-black uppercase text-[10px] tracking-widest">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item: any) => (
                    <TableRow
                      key={`${item.entityType}-${item.id}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="px-8">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                            {getIcon(item.entityType)}
                          </div>
                          <span className="text-xs font-black uppercase tracking-tighter opacity-60">
                            {item.entityType}
                          </span>
                          {item.isAiGenerated && (
                            <span className="bg-purple-100 text-purple-700 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                              AI
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {item.title || item.name}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-500">
                        {item.class?.name || "Shared"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-400">
                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="px-8 text-end">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold"
                            onClick={() => handleAction(item.entityType, item.id, "approved")}
                            disabled={isProcessing}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t("resources.admin-approvals.approve")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 font-bold"
                            onClick={() => handleAction(item.entityType, item.id, "rejected")}
                            disabled={isProcessing}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t("resources.admin-approvals.reject")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalsPage;
