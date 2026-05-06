import { useCustomMutation, useGetIdentity, useNavigation } from "@refinedev/core";
import { User } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useOnboarding = () => {
  const { t } = useTranslation();
  const { data: identity, refetch: refetchIdentity } = useGetIdentity<User>() as any;
  const { push } = useNavigation() as any;

  const { mutate: selectSuite, isPending: isSelecting } = useCustomMutation() as any;

  const handleSuiteSelection = (suiteType: "private" | "school" | "faculty" | "corporate") => {
    selectSuite({
      url: `${import.meta.env.VITE_API_URL}/onboarding/suite-select`,
      method: "post",
      values: { suiteType },
      onSuccess: () => {
        toast.success(t("onboarding.suiteSuccess", "Suite activated successfully!"));
        refetchIdentity().then(() => {
          push("/dashboard");
        });
      },
      onError: (error: any) => {
        toast.error(error?.message || t("onboarding.suiteError", "Failed to activate suite."));
      },
    });
  };

  const handleCorporateActivation = (values: {
    organizationName: string;
    hrContactName: string;
    employeeCount: number;
  }) => {
    selectSuite(
      {
        url: `${import.meta.env.VITE_API_URL}/schools/activate-corporate`,
        method: "post",
        values,
      },
      {
        onSuccess: () => {
          toast.success(t("onboarding.corporateSuccess", "Corporate suite activated!"));
          refetchIdentity().then(() => {
            // Check if corporate dashboard exists (by policy we try to push, router will catch if 404)
            // But prompt says: If /corporate/dashboard does not exist yet: redirect to /dashboard
            // In this specific codebase, we don't have a reliable way to check if route exists without trying.
            // We'll follow the prompt logic.
            push("/dashboard");
          });
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to activate corporate suite.");
        },
      }
    );
  };

  return {
    identity,
    isSelecting,
    handleSuiteSelection,
    handleCorporateActivation,
  };
};
