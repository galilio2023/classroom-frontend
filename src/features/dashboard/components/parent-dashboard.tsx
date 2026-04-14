import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetIdentity, useList, useCustomMutation, useGo } from "@refinedev/core";
import { User } from "@/types";
import { AnimatePresence } from "framer-motion";
import { DashboardData } from "@/types/dashboard";
import { StatsSkeleton } from "./dashboard-skeletons";
import { toast } from "sonner";

// Sub-components
import { ParentHeader } from "./parent/ParentHeader";
import { LinkChildDialog } from "./parent/LinkChildDialog";
import { NoChildrenEmptyState } from "./parent/NoChildrenEmptyState";
import { ChildCard } from "./parent/ChildCard";

interface ParentDashboardProps {
  data: DashboardData;
  isLoading?: boolean;
  show: (resource: string, id: string | number) => void;
}

export const ParentDashboard = ({ isLoading, show }: ParentDashboardProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { data: identity } = useGetIdentity<User>();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const go = useGo();

  const {
    result: { data: children } = { data: [] },
    query: { isLoading: isLoadingChildren, refetch },
  } = useList<User>({
    resource: "users/children",
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  const { mutate: linkStudent, mutation: isLinking } = useCustomMutation<any>();

  const handleLinkStudent = () => {
    if (!studentEmail) {
      toast.error(t("dashboard.parent.enterEmailError"));
      return;
    }

    linkStudent(
      {
        url: "/api/users/link-student",
        method: "post",
        values: {
          studentEmail,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("dashboard.parent.linkSuccess"));
          setIsLinkDialogOpen(false);
          setStudentEmail("");
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || t("dashboard.parent.linkError"));
        },
      }
    );
  };

  const handleContactTeachers = (_childId: string) => {
    go({ to: "/messages" });
  };

  if (isLoading || isLoadingChildren) {
    return <StatsSkeleton />;
  }

  return (
    <div className="space-y-16 md:space-y-24">
      <ParentHeader childrenCount={children.length} onLinkClick={() => setIsLinkDialogOpen(true)} />

      {children.length === 0 ? (
        <NoChildrenEmptyState onLinkClick={() => setIsLinkDialogOpen(true)} />
      ) : (
        <div className="grid gap-8 md:gap-12 grid-cols-1 lg:grid-cols-2 pb-6 px-2">
          <AnimatePresence mode="popLayout">
            {children.map((child: any, index: number) => (
              <ChildCard
                key={child.id}
                child={child}
                index={index}
                isAr={isAr}
                show={show}
                onContact={handleContactTeachers}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <LinkChildDialog
        isOpen={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        studentEmail={studentEmail}
        setStudentEmail={setStudentEmail}
        onLink={handleLinkStudent}
        isLinking={isLinking.isPending}
      />
    </div>
  );
};
