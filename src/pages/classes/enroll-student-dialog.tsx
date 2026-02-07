import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelect, useCreate } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

interface EnrollStudentDialogProps {
  classId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  enrolledStudentIds: string[];
}

export const EnrollStudentDialog = ({
  classId,
  isOpen,
  onOpenChange,
  enrolledStudentIds,
}: EnrollStudentDialogProps) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { mutate: createEnrollment, isLoading } = useCreate();

  const { options: studentOptions } = useSelect<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: UserRole.STUDENT }],
    optionLabel: "name",
    optionValue: "id",
  });

  const handleEnroll = () => {
    if (!selectedStudentId) {
      toast.error("Please select a student.");
      return;
    }

    createEnrollment(
      {
        resource: "enrollments",
        values: {
          classId: Number(classId),
          studentId: selectedStudentId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Student enrolled successfully!");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to enroll student.");
        },
      }
    );
  };

  const availableStudents = studentOptions.filter(
    (option) => !enrolledStudentIds.includes(String(option.value))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll a New Student</DialogTitle>
          <DialogDescription>
            Select a student from the list to enroll them in this class.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a student..." />
            </SelectTrigger>
            <SelectContent>
              {availableStudents.length > 0 ? (
                availableStudents.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  All available students are already enrolled.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEnroll} disabled={isLoading || availableStudents.length === 0}>
            {isLoading ? "Enrolling..." : "Enroll Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
