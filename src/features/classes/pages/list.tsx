import { Key, PlusCircle, Loader2, AlertCircle, Layers, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { TeacherDiscoveryList } from "@/components/classes/teacher-discovery-list";
import { ApplyTeacherDialog } from "./apply-teacher-dialog";
import { useClassList } from "../hooks/use-class-list";
import { ClassCard } from "../components/class-card";
import { ClassFilters } from "../components/class-filters";
import { ClassListItem } from "@/types";
import usePageTitle from "@/hooks/use-page-title";

const ClassesList = () => {
  const { t } = useTranslation();
  const { data, status, filters, state, actions } = useClassList();

  usePageTitle(t("classes.list.title"));

  return (
    <div className="space-y-8 md:space-y-12 max-w-screen-2xl mx-auto">
      <ListView>
        <div className="space-y-8 md:space-y-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
          >
            <div className="space-y-4 flex-1">
              <Breadcrumb />
              <div className="space-y-1 text-start">
                <h1 className="page-title mb-0">
                  {status.isStudent
                    ? filters.view === "discovery"
                      ? t("classes.list.discover")
                      : t("classes.list.myClassrooms")
                    : t("classes.list.myClassrooms")}
                </h1>
                <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                  {status.isStudent
                    ? filters.view === "discovery"
                      ? t("classes.list.discoverDescription")
                      : t("classes.list.myDescription")
                    : t("classes.list.myDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {status.isStudent && (
                <div className="flex bg-muted/50 p-1 rounded-2xl border border-border/40 me-2">
                  <Button
                    variant={filters.view === "discovery" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-xl font-bold px-6"
                    onClick={() => filters.setView("discovery")}
                  >
                    {t("classes.list.discover")}
                  </Button>
                  <Button
                    variant={filters.view === "my" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-xl font-bold px-6"
                    onClick={() => filters.setView("my")}
                  >
                    {t("classes.list.myClassrooms")}
                  </Button>
                </div>
              )}
              {status.isStudent && (
                <Dialog open={state.isJoinModalOpen} onOpenChange={state.setIsJoinModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full md:w-auto gap-2 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] h-12 md:h-14"
                    >
                      <Key className="h-4 w-4" /> {t("buttons.joinByCode")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] bg-card/95 backdrop-blur-xl border-none shadow-2xl">
                    <DialogHeader className="space-y-4">
                      <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                        <Key className="h-8 w-8" />
                      </div>
                      <div className="space-y-2 text-center">
                        <DialogTitle className="text-3xl font-black">
                          {t("classes.list.joinModal.title")}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground px-4">
                          {t("classes.list.joinModal.description")}
                        </DialogDescription>
                      </div>
                    </DialogHeader>
                    <div className="py-10">
                      <Input
                        placeholder="XXXX-XXXX"
                        value={state.inviteCode}
                        onChange={(e) => state.setInviteCode(e.target.value.toUpperCase())}
                        className="h-24 text-center text-4xl sm:text-5xl font-black font-mono tracking-widest rounded-3xl bg-muted/30 border-none shadow-inner"
                        maxLength={8}
                        dir="ltr"
                      />
                    </div>
                    <DialogFooter className="sm:justify-center gap-3">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="rounded-xl px-8"
                        onClick={() => state.setIsJoinModalOpen(false)}
                      >
                        {t("buttons.cancel")}
                      </Button>
                      <Button
                        size="lg"
                        className="rounded-xl px-10 shadow-xl shadow-primary/20"
                        onClick={actions.handleJoinByCode}
                        disabled={status.isJoining || state.inviteCode.length !== 8}
                      >
                        {status.isJoining ? (
                          <Loader2 className="h-4 w-4 animate-spin me-2" />
                        ) : (
                          <PlusCircle className="h-4 w-4 me-2" />
                        )}
                        {t("buttons.joinClass")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {(status.isTeacher || status.isAdmin) && (
                <Button
                  onClick={() => actions.create("classes")}
                  size="lg"
                  className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25"
                >
                  <PlusCircle className="h-5 w-5" /> {t("buttons.createClass")}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Archive Alert */}
          <AnimatePresence>
            {data.selectedTerm?.status === "archived" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-6 md:p-8 rounded-3xl flex items-center gap-5 text-start"
              >
                <div className="p-3.5 rounded-2xl bg-amber-500/20 shrink-0">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-[0.2em] text-[10px]">
                    {t("dashboard.archiveViewActive")}
                  </p>
                  <p className="text-base font-bold opacity-90">
                    {t("dashboard.archiveViewDescription", {
                      termName: data.selectedTerm.name,
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {status.isStudent && filters.view === "my" && <TeacherDiscoveryList />}

          <ClassFilters
            searchQuery={filters.search}
            setSearchQuery={filters.setSearch}
            selectedDepartment={filters.department}
            setSelectedDepartment={filters.setDepartment}
            selectedSubject={filters.subject}
            setSelectedSubject={filters.setSubject}
            departments={data.departments}
            subjects={data.subjects}
          />

          <div className="relative">
            {status.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card
                    key={i}
                    className="p-6 md:p-8 flex flex-col gap-6 border-border/20 bg-background/50 rounded-4xl"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-full rounded-xl" />
                      <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : data.classes.length === 0 ? (
              <div className="flex items-center justify-center p-12 md:p-20 bg-card/20 rounded-[3rem] border-2 border-dashed border-border/40 text-center">
                <EmptyState
                  icon={Layers}
                  title={t("classes.list.noClasses")}
                  description={
                    status.isStudent
                      ? t("classes.list.noClassesDescriptionStudent")
                      : t("classes.list.noClassesDescriptionTeacher")
                  }
                  action={
                    status.isStudent
                      ? {
                          label: t("buttons.joinClass"),
                          onClick: () => state.setIsJoinModalOpen(true),
                        }
                      : status.isTeacher
                        ? {
                            label: t("buttons.createClass"),
                            onClick: () => actions.create("classes"),
                          }
                        : undefined
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {(data.classes as ClassListItem[]).map((classItem, index) => (
                    <ClassCard
                      key={classItem.id}
                      classItem={classItem}
                      index={index}
                      identity={data.identity}
                      isStudent={status.isStudent}
                      isTeacher={status.isTeacher}
                      isAdmin={status.isAdmin}
                      isEnrolling={status.isEnrolling}
                      applications={data.applications}
                      onShow={(id) => actions.show("classes", id)}
                      onEdit={(id) => actions.edit("classes", id)}
                      onDelete={(id) => state.setDeleteTarget(id)}
                      onClone={actions.handleClone}
                      onEnroll={actions.handleEnrollRequest}
                      onApply={(id, name) => state.setApplyTarget({ id, name })}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </ListView>

      <AlertDialog
        open={state.deleteTarget !== null}
        onOpenChange={() => state.setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader className="space-y-4">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-3xl font-black">
                {t("classes.list.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium px-4">
                {t("classes.list.deleteDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl px-8">{t("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.handleConfirmDelete}
              className="rounded-xl px-10 bg-destructive"
            >
              {t("buttons.deleteClass")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ApplyTeacherDialog
        isOpen={state.applyTarget !== null}
        onOpenChange={(open) => !open && state.setApplyTarget(null)}
        classId={state.applyTarget?.id || 0}
        className={state.applyTarget?.name || ""}
        onSuccess={() =>
          actions.invalidate({
            resource: "teacher-applications",
            invalidates: ["list"],
          })
        }
      />
    </div>
  );
};

export default ClassesList;
