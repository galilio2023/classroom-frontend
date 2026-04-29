import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useOnboarding = () => {
  const { t } = useTranslation();
  const { data: identity, refetch: refetchIdentity } = useGetIdentity<User>() as any;

  const { mutate: selectSuite, isLoading: isSelecting } = useCustomMutation() as any;

  const handleSuiteSelection = (suiteType: "private" | "school" | "faculty" | "corporate") => {
    selectSuite({
      url: `${import.meta.env.VITE_API_URL}/onboarding/suite-select`,
      method: "post",
      values: { suiteType },
      onSuccess: () => {
        toast.success(t("onboarding.suiteSuccess", "Suite activated successfully!"));
        refetchIdentity();
      },
      onError: (error: any) => {
        toast.error(error?.message || t("onboarding.suiteError", "Failed to activate suite."));
      },
    });
  };

  return {
    identity,
    isSelecting,
    handleSuiteSelection,
  };
};
