import { motion } from "framer-motion";
import { Users as UsersIcon, UserPlus } from "lucide-react";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { CreateButton } from "@/components/refine/buttons/create";
import { useTranslation } from "react-i18next";

interface UserListHeaderProps {
  isAdmin: boolean;
}

export const UserListHeader = ({ isAdmin }: UserListHeaderProps) => {
  const { t } = useTranslation();

  return (
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
        {isAdmin && (
          <CreateButton className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/25">
            <UserPlus className="h-5 w-5 me-2 rtl:me-0 rtl:ms-2" /> {t("buttons.addNewUser")}
          </CreateButton>
        )}
      </div>
    </motion.div>
  );
};
