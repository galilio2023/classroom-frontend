import { useGetIdentity, useGo, useLogout } from "@refinedev/core";
import { User, UserRole, VerificationStatus } from "@/types";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useVerificationLogic = () => {
  const { t } = useTranslation();
  const { data: identity, refetch, isLoading } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();
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

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tablawy_auth_token")}`,
        },
        body: JSON.stringify({
          verificationDocumentUrl: url,
          verificationDocumentCldPubId: publicId,
          version: identity.version,
        }),
      });

      if (!response.ok) throw new Error("Failed to update document");

      toast.success(t("auth.pending.reverificationSuccess"));
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error(t("auth.pending.reverificationError"));
    }
  };

  return {
    identity,
    isLoading,
    handleCheckStatus,
    submitReverification,
    logout,
  };
};
