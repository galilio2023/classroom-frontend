import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap, Plus, Trash2, Play, Settings2, AlertCircle, Loader2 } from "lucide-react";
import { useList, useUpdate, useOne } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutomationRule, Class, Module } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MarketplaceFunnel } from "./marketplace-funnel";

interface Props {
  classId: string;
  aClass: Class;
}

export const AutomationsTabWrapper = ({ classId, aClass }: Props) => {
  const [activeSubTab, setActiveSubTab] = useState("rules");

  const { query: statsQuery } = useOne({
    resource: "stats/marketplace",
    id: classId,
    queryOptions: { enabled: activeSubTab === "analytics" },
  });

  const { data: statsData, isLoading: isStatsLoading } = statsQuery;

  return (
    <div className="space-y-10">
      {/* Sub-navigation */}
      <div className="flex items-center gap-4 border-b pb-4">
        <button
          onClick={() => setActiveSubTab("rules")}
          className={cn(
            "text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full transition-all",
            activeSubTab === "rules"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Automation Rules
        </button>
        <button
          onClick={() => setActiveSubTab("analytics")}
          className={cn(
            "text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full transition-all",
            activeSubTab === "analytics"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Marketplace Insights
        </button>
      </div>

      {activeSubTab === "rules" ? (
        <RulesContent classId={classId} aClass={aClass} />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isStatsLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-12 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                Analyzing Funnel Data...
              </p>
            </div>
          ) : (
            <MarketplaceFunnel
              data={
                statsData?.data?.funnel || {
                  impressions: 0,
                  previewClicks: 0,
                  registrationAttempts: 0,
                  enrollments: 0,
                  stitchedConversions: 0,
                }
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

const RulesContent = ({ classId, aClass }: Props) => {
  const { t } = useTranslation();
  const { mutate: updateClass } = useUpdate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const rules = (aClass.automationRules as AutomationRule[]) || [];

  const { result: modulesResult } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
  });
  const modules = modulesResult?.data || [];

  const handleToggleRule = (ruleId: string, newState: boolean) => {
    const updatedRules = rules.map((r) => (r.id === ruleId ? { ...r, isActive: newState } : r));
    updateClass(
      {
        resource: "classes",
        id: classId,
        values: { automationRules: updatedRules },
      },
      {
        onSuccess: () => {
          toast.success(newState ? "Automation Activated" : "Automation Paused");
        },
      }
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = rules.filter((r) => r.id !== ruleId);
    updateClass({
      resource: "classes",
      id: classId,
      values: { automationRules: updatedRules },
    });
  };

  const handleAddRule = (newRule: Omit<AutomationRule, "id">) => {
    const rule: AutomationRule = {
      ...newRule,
      id: Math.random().toString(36).substring(7),
    };
    updateClass(
      {
        resource: "classes",
        id: classId,
        values: { automationRules: [...rules, rule] },
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          toast.success("Classroom Trigger Created!");
        },
      }
    );
  };

  return (
    <div className="space-y-8 text-start">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            Classroom Automations
          </h2>
          <p className="text-muted-foreground font-medium">
            Set up intelligent triggers to manage your classroom on autopilot.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-xl font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Create Trigger
        </Button>
      </div>

      {rules.length > 0 ? (
        <div className="grid gap-6">
          {rules.map((rule) => (
            <motion.div key={rule.id} layout>
              <Card
                className={cn(
                  "border-none shadow-xl rounded-[2rem] overflow-hidden transition-all duration-300",
                  !rule.isActive && "opacity-60 grayscale-[0.5]"
                )}
              >
                <CardContent className="p-8 flex items-center justify-between gap-8">
                  <div className="flex items-center gap-6 flex-1">
                    <div
                      className={cn(
                        "p-4 rounded-3xl",
                        rule.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {rule.action.type === "publish_module" ? (
                        <Play className="h-6 w-6" />
                      ) : (
                        <AlertCircle className="h-6 w-6" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black tracking-tight">{rule.name}</h3>
                        {rule.isActive ? (
                          <Badge className="bg-success/10 text-success border-none text-[8px] uppercase font-black">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] uppercase font-black">
                            Paused
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium max-w-xl">
                        When{" "}
                        <span className="text-foreground font-black">
                          {rule.trigger.threshold}%
                        </span>{" "}
                        of students finish{" "}
                        <span className="text-primary font-bold">
                          {modules.find((m) => m.id === rule.trigger.moduleId)?.name || "Module"}
                        </span>
                        , then{" "}
                        <span className="text-foreground font-black lowercase">
                          {rule.action.type.replace("_", " ")}
                        </span>{" "}
                        <span className="text-primary font-bold">
                          {rule.action.type === "publish_module"
                            ? modules.find((m) => m.id === rule.action.targetModuleId)?.name
                            : ""}
                        </span>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">
                        Status
                      </Label>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(val) => handleToggleRule(rule.id, val)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-20 rounded-[3rem] bg-muted/20 border-2 border-dashed flex flex-col items-center justify-center text-center gap-4">
          <div className="p-6 rounded-full bg-muted/30">
            <Settings2 className="h-12 w-12 text-muted-foreground opacity-20" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black uppercase tracking-widest text-sm">No Automations Active</h3>
            <p className="text-xs font-medium text-muted-foreground max-w-xs mx-auto">
              Save time by creating triggers that automatically publish content as your class
              progresses.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            Create Your First Trigger
          </Button>
        </div>
      )}

      <CreateRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAdd={handleAddRule}
        modules={modules}
      />
    </div>
  );
};

const CreateRuleModal = ({ isOpen, onClose, onAdd, modules }: any) => {
  const [name, setName] = useState("");
  const [threshold, setThreshold] = useState("70");
  const [triggerModule, setTriggerModule] = useState("");
  const [actionType, setActionType] = useState("publish_module");
  const [targetModule, setTargetModule] = useState("");

  const handleSubmit = () => {
    if (!name || !triggerModule) {
      toast.error("Please fill in all required fields.");
      return;
    }

    onAdd({
      name,
      isActive: true,
      trigger: {
        type: "completion_threshold",
        threshold: Number(threshold),
        moduleId: Number(triggerModule),
      },
      action: {
        type: actionType as any,
        targetModuleId: actionType === "publish_module" ? Number(targetModule) : undefined,
        announcementTitle: actionType === "send_announcement" ? "New Content Unlocked!" : undefined,
        announcementMessage:
          actionType === "send_announcement"
            ? "A new module is now available based on your class progress."
            : undefined,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
        <DialogHeader className="pt-6">
          <DialogTitle className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            New Automation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 text-start">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Automation Name
            </Label>
            <Input
              placeholder="e.g. Publish Week 2 Automatically"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl bg-muted/20 border-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Trigger Module
              </Label>
              <Select onValueChange={setTriggerModule}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                  <SelectValue placeholder="Select Module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Threshold (%)
              </Label>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="h-12 rounded-xl bg-muted/20 border-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Action
            </Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                <SelectValue placeholder="Select Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish_module">Publish Another Module</SelectItem>
                <SelectItem value="send_announcement">Send Class Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {actionType === "publish_module" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Target Module to Publish
              </Label>
              <Select onValueChange={setTargetModule}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                  <SelectValue placeholder="Select Target" />
                </SelectTrigger>
                <SelectContent>
                  {modules
                    .filter((m: any) => !m.isPublished)
                    .map((m: any) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            Create Automation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
