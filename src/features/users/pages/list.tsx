import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import {
  Users as UsersIcon,
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  ExternalLink,
  Trash2,
  Layers,
} from "lucide-react";
import { CreateButton } from "@/components/refine-ui/buttons/create";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useUserList } from "../hooks/use-user-list";
import { UserCard } from "../components/user-card";
import { UserFilters } from "../components/user-filters";
import { UserStats } from "../components/user-stats";
import { VerificationStatus } from "@/types";
import usePageTitle from "@/hooks/use-page-title";

const UsersList = () => {
  const { t, i18n } = useTranslation();
  const { data, status, filters, state, actions } = useUserList();

  usePageTitle(t("users.governance.title"));

  return (
    <>
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
                <h1 className="page-title mb-0 flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                    <UsersIcon className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  {t("users.governance.title")}
                </h1>
                <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                  {t("users.governance.description")}
                </p>
              </div>
            </div>
            <div className="w-full md:w-auto">
              {data.isAdmin && (
                <CreateButton className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/25">
                  <UserPlus className="h-5 w-5 me-2 rtl:me-0 rtl:ms-2" />{" "}
                  {t("buttons.addNewUser")}
                </CreateButton>
              )}
            </div>
          </motion.div>

          <UserStats
            total={data.stats.total}
            pending={data.stats.pending}
            active={data.stats.active}
            isLoading={status.isLoading}
            language={i18n.language}
          />

          <UserFilters
            searchQuery={filters.searchQuery}
            setSearchQuery={filters.setSearchQuery}
            selectedRole={filters.selectedRole}
            setSelectedRole={filters.setSelectedRole}
            selectedStatus={filters.selectedStatus}
            setSelectedStatus={filters.setSelectedStatus}
            verificationFilter={filters.verificationFilter}
            setVerificationFilter={filters.setVerificationFilter}
          />

          <div className="relative min-h-[400px]">
            {status.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card
                    key={i}
                    className="p-6 flex flex-col md:flex-row items-center gap-6 border-border/20 bg-background/50"
                  >
                    <Skeleton className="h-20 w-20 rounded-3xl shrink-0" />
                    <div className="flex-1 space-y-4 w-full">
                      <Skeleton className="h-8 w-3/4" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-12 w-36 rounded-2xl" />
                  </Card>
                ))}
              </div>
            ) : data.users.length === 0 ? (
              <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
                <EmptyState
                  icon={Layers}
                  title={t("users.governance.table.noUsers")}
                  description={t("users.governance.table.noUsersDesc")}
                  action={
                    data.isAdmin
                      ? {
                          label: t("buttons.addNewUser"),
                          onClick: () => actions.create("users"),
                        }
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {data.users.map((user, index) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      index={index}
                      isAdmin={data.isAdmin}
                      identityId={data.identity?.id}
                      isAr={data.isAr}
                      onShow={(id) => actions.show("users", id)}
                      onStatusChange={actions.handleStatusChange}
                      onDelete={(id) => state.setDeleteTarget(id)}
                      onReview={(u) => state.setVerificationTarget(u)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </ListView>

      {/* Verification Dialog */}
      <Dialog
        open={state.verificationTarget !== null}
        onOpenChange={() => state.setVerificationTarget(null)}
      >
        <DialogContent className="max-w-2xl overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-0">
          <div className="p-8 md:p-12 space-y-8">
            <DialogHeader className="space-y-4">
              <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2 text-center">
                <DialogTitle className="text-3xl font-black">
                  {t("users.governance.verification.title")}
                </DialogTitle>
                <DialogDescription className="font-medium text-base px-6">
                  {t("users.governance.verification.description", {
                    name: state.verificationTarget?.name,
                  })}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-8 rounded-4xl border border-border/40 text-start">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60">
                    {t("users.governance.verification.fullName")}
                  </p>
                  <p className="font-black text-lg">
                    {state.verificationTarget?.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60">
                    {t("users.governance.verification.email")}
                  </p>
                  <p className="font-black text-lg">
                    {state.verificationTarget?.email}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60">
                    {t("users.governance.verification.status")}
                  </p>
                  <Badge
                    variant={
                      state.verificationTarget?.verificationStatus ===
                      VerificationStatus.VERIFIED
                        ? "default"
                        : "secondary"
                    }
                    className="h-7 uppercase text-[10px] font-black"
                  >
                    {state.verificationTarget?.verificationStatus ===
                    VerificationStatus.VERIFIED
                      ? t("users.governance.verification.verified")
                      : t("users.governance.verification.pending")}
                  </Badge>
                </div>
              </div>

              {state.verificationTarget?.verificationDocumentUrl && (
                <div className="border-2 border-primary/10 rounded-4xl p-8 flex flex-col items-center gap-6 bg-card relative overflow-hidden text-start">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                      <FileText className="h-10 w-10 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-black">
                        {t("users.governance.verification.proofTitle")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("users.governance.verification.proofDesc")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-2xl font-black uppercase text-[10px] h-12"
                      asChild
                    >
                      <a
                        href={state.verificationTarget.verificationDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 me-2" />{" "}
                        {t("buttons.viewFull")}
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-4 pt-8 border-t border-border/40">
              <Button
                variant="outline"
                size="lg"
                className="text-destructive border-destructive/20 h-12 rounded-2xl"
                onClick={() =>
                  actions.handleVerify(state.verificationTarget!.id, false)
                }
                disabled={status.isUpdating}
              >
                <XCircle className="h-4 w-4 me-2" /> {t("buttons.reject")}
              </Button>
              <Button
                size="lg"
                className="h-12 rounded-2xl shadow-xl shadow-primary/20"
                onClick={() =>
                  actions.handleVerify(state.verificationTarget!.id, true)
                }
                disabled={status.isUpdating}
              >
                {status.isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 me-2" />
                )}{" "}
                {t("buttons.approveVerify")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={state.deleteTarget !== null}
        onOpenChange={() => state.setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg">
          <AlertDialogHeader className="space-y-6">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black">
                {t("users.governance.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-base px-8">
                {t("users.governance.deleteDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-4 pt-8">
            <AlertDialogCancel className="rounded-2xl px-10 h-14 font-black uppercase text-[10px]">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.handleConfirmDelete}
              className="rounded-2xl px-12 h-14 bg-destructive"
            >
              {t("buttons.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UsersList;
