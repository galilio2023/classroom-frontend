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
}

export const EnrollStudentDialog = ({
  classId,
  isOpen,
  onOpenChange,
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
              {studentOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEnroll} disabled={isLoading}>
            {isLoading ? "Enrolling..." : "Enroll Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
