import { useGetIdentity, useGo, useLogout, useUpdate } from "@refinedev/core";
import { User, UserRole, VerificationStatus } from "@/types";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { handleError } from "@/providers/utils/api-errors";

export const useVerificationLogic = () => {
  const { t } = useTranslation();
  const { data: identity, refetch, isLoading } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();
  const { mutate: update } = useUpdate();
  const go = useGo();

  useEffect(() => {
    if (!isLoading && identity) {
      const isVerified = identity.verificationStatus === VerificationStatus.VERIFIED;
      const isAdmin = identity.role === UserRole.ADMIN;
      const isStudent = identity.role === UserRole.STUDENT;

      if (isVerified || isAdmin || isStudent) {
        go({ to: "/" });
      }
    }
  }, [identity, isLoading, go]);

  const handleCheckStatus = async () => {
    const { data } = await refetch();
    if (data) {
      const isVerified = data.verificationStatus === VerificationStatus.VERIFIED;
      if (isVerified) {
        toast.success(t("auth.pending.successToast"));
        go({ to: "/" });
      } else {
        toast.info(t("auth.pending.infoToast"));
      }
    }
  };

  const submitReverification = async (url: string, publicId: string) => {
    if (!identity) return;

    update(
      {
        resource: "users",
        id: "me",
        values: {
          verificationDocumentUrl: url,
          verificationDocumentCldPubId: publicId,
          version: identity.version,
        },
      },
      {
        onSuccess: async () => {
          toast.success(t("auth.pending.reverificationSuccess"));
        },
        onError: async (error) => {
          const apiError = await handleError(error);
          toast.error(apiError.message);
        },
      }
    );
  };

  return {
    identity,
    isLoading,
    handleCheckStatus,
    submitReverification,
    logout,
  };
};
