import { useList, useCreate, useDelete, useGetIdentity, useCustomMutation } from "@refinedev/core";
import { useState } from "react";
import { Module, User, Resource } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Loader2, Library } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/features/users/hooks/use-capabilities";

import { ResourcesEmptyState } from "../components/class-empty-states";
import { ResourceHeader } from "../components/resources/ResourceHeader";
import { ResourceItem } from "../components/resources/ResourceItem";
import { AddResourceDialog } from "../components/resources/AddResourceDialog";

interface ResourceTabProps {
  classId: string;
}

export const ResourceTab = ({ classId }: ResourceTabProps) => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const { canManageCurriculum: isTeacher } = useCapabilities();

  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

  const { query } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const modules = query.data?.data || [];
  const isLoading = query.isPending;

  const { mutate: createResource, mutation: createMutation } = useCreate<Resource>();
  const { mutate: deleteResource } = useDelete();
  const { mutate: updateResource } = useCustomMutation();
  const { mutate: featureResource } = useCustomMutation();

  const toggleAiPin = (res: Resource) => {
    updateResource(
      {
        url: `resources/${res.id}`,
        method: "patch",
        values: { isAiPinned: !res.isAiPinned, version: res.version },
      },
      {
        onSuccess: () => {
          toast.success(!res.isAiPinned ? "Pinned to AI!" : "Unpinned from AI");
          query.refetch();
        },
      }
    );
  };

  const handleAddResource = (resourceData: any) => {
    if (!resourceData.title || !activeModuleId) {
      toast.error(t("classes.resource.toast.fillRequired"));
      return;
    }

    createResource(
      {
        resource: "resources",
        values: { ...resourceData, classId: Number(classId), moduleId: activeModuleId },
      },
      {
        onSuccess: () => {
          setIsAddResourceOpen(false);
          setActiveModuleId(null);
          query.refetch();
          toast.success(t("classes.resource.toast.added"));
        },
      }
    );
  };

  const handleDeleteResource = (id: number) => {
    deleteResource(
      { resource: "resources", id },
      {
        onSuccess: () => {
          toast.success(t("classes.resource.toast.deleted"));
          query.refetch();
        },
      }
    );
  };

  const handleFeatureResource = (id: number) => {
    featureResource({
      url: "/channels/feature-resource",
      method: "post",
      values: { resourceId: id },
      successNotification: () => ({
        type: "success",
        message: "Highlighted!",
        description: "This lesson is now featured on your public Teacher TV channel.",
      }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-start">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          {t("classes.resource.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <ResourceHeader />

      {modules.length === 0 ? (
        <ResourcesEmptyState isTeacher={isTeacher} />
      ) : (
        <Accordion type="multiple" className="w-full space-y-6">
          <AnimatePresence mode="popLayout">
            {modules.map((module: Module) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AccordionItem
                  value={`module-${module.id}`}
                  className="border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden group transition-all hover:shadow-2xl hover:bg-card/80 text-start"
                >
                  <div className="flex items-center justify-between w-full px-6">
                    <AccordionTrigger className="hover:no-underline py-6 flex-1 group/trigger">
                      <div className="flex items-center gap-4 text-start">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover/trigger:scale-110 transition-transform">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-black text-lg tracking-tight group-hover/trigger:text-primary transition-colors text-start">
                            {module.name}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                              {t("classes.resource.itemsCount", {
                                count: module.resources?.length || 0,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    {isTeacher && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-10 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-primary/20 text-primary hover:bg-primary/5",
                          "ms-4"
                        )}
                        onClick={() => {
                          setActiveModuleId(module.id);
                          setIsAddResourceOpen(true);
                        }}
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        {t("buttons.addMaterial")}
                      </Button>
                    )}
                  </div>
                  <AccordionContent className="pb-8 pt-2 px-8">
                    <div className="grid grid-cols-1 gap-3 text-start">
                      {module.resources && module.resources.length > 0 ? (
                        module.resources.map((res) => (
                          <ResourceItem
                            key={res.id}
                            res={res}
                            classId={classId}
                            isTeacher={isTeacher}
                            onDelete={handleDeleteResource}
                            onToggleAiPin={toggleAiPin}
                            onFeature={handleFeatureResource}
                          />
                        ))
                      ) : (
                        <div className="p-10 rounded-2xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                          <Library className="h-8 w-8 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest">
                            {t("classes.resource.noMaterialsInModule")}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </Accordion>
      )}

      <AddResourceDialog
        isOpen={isAddResourceOpen}
        onOpenChange={setIsAddResourceOpen}
        onAdd={handleAddResource}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
