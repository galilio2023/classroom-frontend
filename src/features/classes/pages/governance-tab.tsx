import React from "react";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/switch"; // Wait, check import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { ShieldCheck, History, Undo2, BrainCircuit } from "lucide-react";

interface GovernanceTabProps {
  classId: string;
}

export const GovernanceTab: React.FC<GovernanceTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const { mutate } = useCustomMutation();

  // Fetch Settings
  const { data: settingsData, refetch: refetchSettings } = useCustom({
    url: "/teacher/intelligence/settings",
    method: "get",
  });

  // Fetch Actions Log
  const { data: actionsData, refetch: refetchActions } = useCustom({
    url: "/teacher/intelligence/actions",
    method: "get",
  });

  const settings = settingsData?.data || [];
  const actions = actionsData?.data || [];

  const handleToggle = (category: string, current: boolean) => {
    mutate(
      {
        url: `/teacher/intelligence/settings/${category}`,
        method: "patch",
        values: { isAutonomous: !current },
      },
      {
        onSuccess: () => {
          toast.success(t("governance.settings_updated"));
          refetchSettings();
        },
      }
    );
  };

  const handleReverse = (id: string) => {
    mutate(
      {
        url: `/teacher/intelligence/actions/${id}/reverse`,
        method: "post",
        values: {},
      },
      {
        onSuccess: () => {
          toast.success(t("governance.action_reversed"));
          refetchActions();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to reverse action");
        },
      }
    );
  };

  const categories = [
    { id: "whatsapp_alerts", label: "WhatsApp Parent Alerts" },
    { id: "resource_generation", label: "Resource & Micro-lesson Generation" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Card */}
        <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  Autonomy Settings
                </CardTitle>
                <CardDescription>
                  Choose which actions the AI can take without your approval.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {categories.map((cat) => {
              const isAuto =
                settings.find((s: any) => s.category === cat.id)?.isAutonomous ?? false;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm uppercase tracking-wide">{cat.label}</p>
                    <p className="text-xs text-muted-foreground italic">
                      {isAuto ? "Autonomous Mode Active" : "Human-in-the-loop Required"}
                    </p>
                  </div>
                  <Switch checked={isAuto} onCheckedChange={() => handleToggle(cat.id, isAuto)} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-none shadow-2xl bg-primary text-primary-foreground">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black uppercase tracking-tight">
                Teacher Trust Guarantee
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-medium opacity-90">
            <p>
              In accordance with <b>Law 151 (Egypt)</b>, every AI-driven action is logged and
              transparent.
            </p>
            <p>
              You have a <b>24-hour window</b> to reverse any autonomous action taken by the system.
            </p>
            <p>
              Autonomous mode reduces your workload by handling repetitive interventions, but you
              remain the ultimate authority.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Log */}
      <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted text-muted-foreground">
              <History className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight">
                Autonomous Action History
              </CardTitle>
              <CardDescription>Review and manage recent AI actions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">
                    Date
                  </TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">
                    Action
                  </TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">
                    Details
                  </TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">
                    Status
                  </TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">
                    Control
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground italic"
                    >
                      No autonomous actions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  actions.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-xs font-medium">
                        {format(new Date(log.createdAt), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-black text-[9px] uppercase tracking-tighter"
                        >
                          {log.actionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        Student: {log.metadata?.studentId || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.status === "executed" ? "default" : "secondary"}
                          className={cn(
                            "font-black text-[9px] uppercase",
                            log.status === "reversed" &&
                              "bg-destructive/10 text-destructive border-destructive/20"
                          )}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.status === "executed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-xs"
                            onClick={() => handleReverse(log.id)}
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            Reverse
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
