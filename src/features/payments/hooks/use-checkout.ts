import { useState } from "react";
import { useGetIdentity, useCustomMutation } from "@refinedev/core";
import { User } from "@/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface CardOrder {
  id: string;
  iframeUrl: string;
}

export interface KioskOrder {
  id: string;
  referenceCode: string;
  amount: number;
}

/**
 * 💳 useCheckout Hook
 * Centralized logic for Paymob and Kiosk payment orchestration.
 * Decouples business logic from UI components.
 */
export const useCheckout = () => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const navigate = useNavigate();

  const [cardOrder, setCardOrder] = useState<CardOrder | null>(null);
  const [kioskOrder, setKioskOrder] = useState<KioskOrder | null>(null);

  const { mutate: createOrder, mutation: orderMutation } = useCustomMutation<{
    id: string;
    referenceCode?: string;
    iframeUrl?: string;
    amount: number;
  }>();

  const isPending = orderMutation.isPending;

  const handleUpgrade = (
    priceId: string,
    amount: number,
    provider: "paymob" | "fawry" = "paymob"
  ) => {
    if (!identity) {
      toast.info(t("pricing.toasts.loginRequired"));
      navigate("/register");
      return;
    }

    if (priceId === "free") return;

    createOrder(
      {
        url: "/payments/create-order",
        method: "post",
        values: { provider, amount, priceId },
      },
      {
        onSuccess: (response: any) => {
          const data = response.data;
          if (provider === "paymob" && data.iframeUrl) {
            setCardOrder({
              id: data.id,
              iframeUrl: data.iframeUrl,
            });
          } else if (provider === "fawry" && data.referenceCode) {
            setKioskOrder({
              id: data.id,
              referenceCode: data.referenceCode,
              amount: data.amount,
            });
          }
        },
        onError: (error: any) => {
          console.error("Checkout Error:", error);
          toast.error(t("pricing.toasts.checkoutError"));
        },
      }
    );
  };

  const clearOrders = () => {
    setCardOrder(null);
    setKioskOrder(null);
  };

  return {
    handleUpgrade,
    cardOrder,
    kioskOrder,
    isPending,
    clearOrders,
    setCardOrder,
    setKioskOrder,
  };
};
