import { Accordion } from "@/components/ui/accordion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Module } from "@/types";
import { ModuleItem } from "@/features/classes/components/curriculum/module-item";

interface ModuleListProps {
  modules: Module[];
  isTeacher: boolean;
  isStudent: boolean;
  classId: string;
  onDragEnd: (result: DropResult) => void;
  isItemCompleted: (type: "resource" | "assignment" | "quiz", id: number) => boolean;
  onToggleProgress: (
    type: "resource" | "assignment" | "quiz",
    id: number,
    moduleId: number
  ) => void;
  onDeleteModule: (id: number) => void;
  onMagicAction: (moduleId: number, type: string) => void;
  onAddMaterial: (moduleId: number) => void;
  onAddTask: (moduleId: number) => void;
}

export const ModuleList = ({
  modules,
  isTeacher,
  isStudent,
  classId,
  onDragEnd,
  isItemCompleted,
  onToggleProgress,
  onDeleteModule,
  onMagicAction,
  onAddMaterial,
  onAddTask,
}: ModuleListProps) => {
  return (
    <Accordion type="multiple" className="w-full space-y-4 md:space-y-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="modules">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <AnimatePresence mode="popLayout">
                {modules
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((module, idx) => (
                    <Draggable
                      key={module.id}
                      draggableId={module.id.toString()}
                      index={idx}
                      isDragDisabled={!isTeacher}
                    >
                      {(draggableProvided) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          className="mb-4 md:mb-6"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <ModuleItem
                              module={module}
                              isTeacher={isTeacher}
                              isStudent={isStudent}
                              classId={classId}
                              dragHandleProps={draggableProvided.dragHandleProps}
                              isItemCompleted={isItemCompleted}
                              onToggleProgress={onToggleProgress}
                              onDeleteModule={onDeleteModule}
                              onMagicAction={onMagicAction}
                              onAddMaterial={onAddMaterial}
                              onAddTask={onAddTask}
                            />
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Accordion>
  );
};
