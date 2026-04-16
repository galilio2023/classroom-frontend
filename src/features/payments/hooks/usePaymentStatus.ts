import { useState, useEffect } from "react";
import { useCustom } from "@refinedev/core";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const usePaymentStatus = (orderId: string | null) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"pending" | "paid" | "failed">("pending");

  const { query } = useCustom({
    url: `/payments/order/${orderId}`,
    method: "get",
    queryOptions: {
      enabled: !!orderId && status === "pending",
      refetchInterval: 5000, // Poll every 5 seconds
    },
  });

  const { data, refetch } = query;

  useEffect(() => {
    if (data?.data?.status === "paid") {
      setStatus("paid");
      toast.success(t("payments.success"));
    } else if (data?.data?.status === "failed") {
      setStatus("failed");
      toast.error(t("payments.failed"));
    }
  }, [data, t]);

  return { status, order: data?.data };
};
