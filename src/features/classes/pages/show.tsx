import { useParams } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import { ClassBanner } from "@/features/classes/components/show/class-banner";
import { ClassHeader } from "@/features/classes/components/show/class-header";
import { useClassRealtime } from "@/features/classes/hooks/use-class-realtime";

// Modularized Components
import { ContentTabWrapper } from "../components/content-tab-wrapper";
import { AssessmentsTabWrapper } from "../components/assessments-tab-wrapper";
import { EngagementTabWrapper } from "../components/engagement-tab-wrapper";
import { RosterTabWrapper } from "../components/roster-tab-wrapper";
import { ProgressTabWrapper } from "../components/progress-tab-wrapper";
import { InfoTabWrapper } from "../components/info-tab-wrapper";
import { AutomationsTabWrapper } from "../components/automations-tab-wrapper";
import { StaffActions } from "../components/staff-actions";
import { ClassErrorView } from "../components/class-state-views";
import { ClassTabNavigation } from "../components/class-tab-navigation";
import { ClassShowSkeleton } from "../components/class-skeletons";

// Logic Hooks
import { useClassTabs } from "../hooks/use-class-tabs";
import { useClassDetails } from "../hooks/use-class-details";
import { Enrollment } from "@/types";

const ClassesShow = () => {
  const { i18n } = useTranslation();
  const { id } = useParams();
  const classId = id ?? "";
  const isAr = i18n.language === "ar";

  // --- Logic Orchestration ---
  const { activePrimaryTab, activeSubTab, handlePrimaryTabChange, setSearchParams } =
    useClassTabs();

  const {
    identity,
    aClass,
    isLoading,
    isError,
    isStaff,
    isOwner,
    announcements,
    dismissedAnnouncements,
    handleDismissAnnouncement,
    teacherNotes,
    isLoadingNotes,
    handleNoteChange,
    handleEnrollmentAction,
    handleToggleLive,
    handleConfirmUnenroll,
    handleCheckout,
    isCheckingOut,
    isDeleting,
    createMutation,
    isMessaging,
    isModerator,
    refetch,
  } = useClassDetails(classId);

  // --- Local UI State ---
  const [unenrollTarget, setUnenrollTarget] = useState<number | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isMessageAllOpen, setIsMessageAllOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState({ title: "", message: "" });
  const [insightTarget, setInsightTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const { isLiveIndicator } = useClassRealtime(identity?.id, classId);

  if (isLoading) return <ClassShowSkeleton />;
  if (isError || !aClass) return <ClassErrorView />;

  const approvedEnrollments =
    aClass.enrollments?.filter((e: Enrollment) => e.status === "approved") ?? [];

  const isEnrolled = !!approvedEnrollments.find((e: Enrollment) => e.student.id === identity?.id);

  const pendingCount =
    (aClass.enrollments?.filter((e: Enrollment) => e.status === "pending").length ?? 0) +
    (aClass.enrollments?.filter((e: Enrollment) => e.status === "waitlisted").length ?? 0);

  return (
    <>
      <div className="space-y-8 md:space-y-12 pb-20 w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
        <div className="px-2 space-y-4 pt-4 md:pt-8">
          <ClassHeader classId={classId} isOwner={!!isOwner} />
        </div>

        <ClassBanner
          aClass={aClass}
          approvedCount={approvedEnrollments.length}
          waitlistedCount={
            aClass.enrollments?.filter((e: Enrollment) => e.status === "waitlisted").length ?? 0
          }
          isLiveIndicator={isLiveIndicator}
          isStaff={isModerator}
          onToggleLive={handleToggleLive}
          isEnrolled={isEnrolled}
          onCheckout={handleCheckout}
          isCheckingOut={isCheckingOut}
        />

        <Tabs
          value={activePrimaryTab}
          onValueChange={handlePrimaryTabChange}
          className="w-full space-y-8 md:space-y-12"
          dir={isAr ? "rtl" : "ltr"}
        >
          <ClassTabNavigation
            activePrimaryTab={activePrimaryTab}
            isLiveIndicator={isLiveIndicator}
            isStaff={isModerator}
            pendingCount={pendingCount}
            classColor={aClass.color || "#6366f1"}
          />

          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePrimaryTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="focus:outline-none"
              >
                <TabsContent value="content" className="mt-0 focus-visible:outline-none">
                  {activePrimaryTab === "content" && (
                    <ContentTabWrapper
                      classId={classId}
                      aClass={aClass}
                      activeSubTab={activeSubTab}
                      setSearchParams={setSearchParams}
                    />
                  )}
                </TabsContent>

                <TabsContent value="assessments" className="mt-0 focus-visible:outline-none">
                  {activePrimaryTab === "assessments" && (
                    <AssessmentsTabWrapper
                      classId={classId}
                      activeSubTab={activeSubTab}
                      setSearchParams={setSearchParams}
                    />
                  )}
                </TabsContent>

                <TabsContent value="engagement" className="mt-0 focus-visible:outline-none">
                  {activePrimaryTab === "engagement" && (
                    <EngagementTabWrapper
                      classId={classId}
                      announcements={announcements}
                      dismissedAnnouncements={dismissedAnnouncements}
                      handleDismissAnnouncement={handleDismissAnnouncement}
                      isLiveIndicator={isLiveIndicator}
                      activeSubTab={activeSubTab}
                      setSearchParams={setSearchParams}
                    />
                  )}
                </TabsContent>

                <TabsContent value="roster" className="mt-0 focus-visible:outline-none">
                  {activePrimaryTab === "roster" && (
                    <RosterTabWrapper
                      classId={classId}
                      approvedEnrollments={approvedEnrollments}
                      pendingEnrollments={
                        aClass.enrollments?.filter((e: Enrollment) => e.status === "pending") ?? []
                      }
                      isStaff={isStaff}
                      onInsight={setInsightTarget}
                      onUnenroll={setUnenrollTarget}
                      onEnrollClick={() => setIsEnrollDialogOpen(true)}
                      onMessageAllClick={() => setIsMessageAllOpen(true)}
                      onEnrollmentAction={handleEnrollmentAction}
                      activeSubTab={activeSubTab}
                      setSearchParams={setSearchParams}
                    />
                  )}
                </TabsContent>

                {isStaff && (
                  <TabsContent value="progress" className="mt-0 focus-visible:outline-none">
                    {activePrimaryTab === "progress" && (
                      <ProgressTabWrapper
                        classId={classId}
                        activeSubTab={activeSubTab}
                        setSearchParams={setSearchParams}
                      />
                    )}
                  </TabsContent>
                )}

                {isStaff && (
                  <TabsContent value="automations" className="mt-0 focus-visible:outline-none">
                    {activePrimaryTab === "automations" && (
                      <AutomationsTabWrapper classId={classId} aClass={aClass} />
                    )}
                  </TabsContent>
                )}

                <TabsContent value="info" className="mt-0 focus-visible:outline-none">
                  {activePrimaryTab === "info" && (
                    <InfoTabWrapper
                      aClass={aClass}
                      isOwner={!!isOwner}
                      isStaff={isStaff}
                      teacherNotes={teacherNotes}
                      isLoadingNotes={isLoadingNotes}
                      handleNoteChange={handleNoteChange}
                      activeSubTab={activeSubTab}
                      setSearchParams={setSearchParams}
                      onInviteClick={() => setIsInviteDialogOpen(true)}
                      handleCopyInviteCode={() => {
                        if (aClass.inviteCode) {
                          navigator.clipboard.writeText(aClass.inviteCode);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      copied={copied}
                    />
                  )}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>

      {isStaff && (
        <StaffActions
          classId={classId}
          unenrollTarget={unenrollTarget}
          setUnenrollTarget={setUnenrollTarget}
          handleConfirmUnenroll={() =>
            handleConfirmUnenroll(unenrollTarget, () => setUnenrollTarget(null))
          }
          isDeleting={isDeleting}
          isEnrollDialogOpen={isEnrollDialogOpen}
          setIsEnrollDialogOpen={setIsEnrollDialogOpen}
          enrolledStudentIds={approvedEnrollments.map((e: Enrollment) => e.student.id)}
          isInviteDialogOpen={isInviteDialogOpen}
          setIsInviteDialogOpen={setIsInviteDialogOpen}
          existingTeacherIds={aClass.teachers?.map((t) => t.teacher.id) ?? []}
          insightTarget={insightTarget}
          setInsightTarget={setInsightTarget}
          isMessageAllOpen={isMessageAllOpen}
          setIsMessageAllOpen={setIsMessageAllOpen}
          approvedCount={approvedEnrollments.length}
          bulkMessage={bulkMessage}
          setBulkMessage={setBulkMessage}
          handleMessageAll={() =>
            createMutation(
              {
                resource: `classes/${classId}/message-all`,
                values: bulkMessage,
              },
              {
                onSuccess: () => {
                  setIsMessageAllOpen(false);
                  setBulkMessage({ title: "", message: "" });
                  refetch?.();
                },
              }
            )
          }
          isMessaging={isMessaging}
        />
      )}
    </>
  );
};

export default ClassesShow;
