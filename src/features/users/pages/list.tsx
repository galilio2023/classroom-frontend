import { ListView } from "@/components/refine-ui/views/list-view";
import { Layers } from "lucide-react";
import {} from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useUserList } from "../hooks/use-user-list";
import { UserCard } from "../components/user-card";
import { UserFilters } from "../components/user-filters";
import { UserStats } from "../components/user-stats";
import usePageTitle from "@/hooks/use-page-title";

// Sub-components
import { UserListHeader } from "../components/list/UserListHeader";
import { VerificationDialog } from "../components/list/VerificationDialog";
import { DeleteUserDialog } from "../components/list/DeleteUserDialog";

const UsersList = () => {
  const { t, i18n } = useTranslation();
  const { data, status, filters, state, actions } = useUserList();

  usePageTitle(t("users.governance.title"));

  return (
    <>
      <ListView>
        <div className="space-y-8 md:space-y-12">
          <UserListHeader isAdmin={data.isAdmin} />

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
              <div className="space-y-4 text-start">
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

      <VerificationDialog
        target={state.verificationTarget}
        onClose={() => state.setVerificationTarget(null)}
        onVerify={actions.handleVerify}
        isUpdating={status.isUpdating}
      />

      <DeleteUserDialog
        targetId={state.deleteTarget}
        onClose={() => state.setDeleteTarget(null)}
        onConfirm={actions.handleConfirmDelete}
      />
    </>
  );
};

export default UsersList;
