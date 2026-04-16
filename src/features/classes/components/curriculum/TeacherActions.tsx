import { MagicBuilderDialog } from "@/features/classes/components/curriculum/magic-builder-dialog";
import { CreateModuleDialog } from "@/features/classes/components/curriculum/create-module-dialog";
import { AddResourceDialog } from "@/features/classes/components/curriculum/add-resource-dialog";
import { AiFeatureGuard } from "@/features/ai/components/AiFeatureGuard";
import { MagicBuilderConfig } from "@/features/ai/hooks/use-magic-builder";

interface TeacherActionsProps {
  classId: string;
  isMagicModalOpen: boolean;
  setIsMagicModalOpen: (open: boolean) => void;
  magicConfig: MagicBuilderConfig;
  setMagicConfig: (config: MagicBuilderConfig) => void;
  isMagicCreating: boolean;
  onMagicCreate: () => void;
  isAddResourceOpen: boolean;
  setIsAddResourceOpen: (open: boolean) => void;
  activeModuleId: number | null;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  moduleCount: number;
}

export const TeacherActions = ({
  classId,
  isMagicModalOpen,
  setIsMagicModalOpen,
  magicConfig,
  setMagicConfig,
  isMagicCreating,
  onMagicCreate,
  isAddResourceOpen,
  setIsAddResourceOpen,
  activeModuleId,
  isCreateModalOpen,
  setIsCreateModalOpen,
  moduleCount,
}: TeacherActionsProps) => {
  return (
    <>
      <AiFeatureGuard silent>
        <MagicBuilderDialog
          open={isMagicModalOpen}
          onOpenChange={setIsMagicModalOpen}
          initialConfig={magicConfig}
          onGenerate={(config: any) => {
            setMagicConfig(config);
            onMagicCreate();
          }}
          isGenerating={isMagicCreating}
          initialClassId={classId}
        />
      </AiFeatureGuard>

      <AddResourceDialog
        isOpen={isAddResourceOpen}
        onOpenChange={setIsAddResourceOpen}
        classId={Number(classId)}
        moduleId={activeModuleId || 0}
      />

      <CreateModuleDialog
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        classId={Number(classId)}
        order={moduleCount}
      />
    </>
  );
};
