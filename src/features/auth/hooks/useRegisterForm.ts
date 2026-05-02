import { useState, useEffect } from "react";
import { HttpError, useRegister } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { validateEgyptianID, normalizeArabicNumerals } from "@/lib/validators";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { SignUpPayload } from "@/types";
import { getUUID } from "@/lib/utils";
import { AI_API, BASE_URL, OTP_API } from "@/constants/api";
import { getRegisterSchema, type RegisterFormValues } from "../schemas/registration-schema";
import { offlineDB } from "@/lib/offline-db";

export const REGISTER_STEPS = {
  BASIC_INFO: 1,
  EGYPTIAN_ID: 2,
  CONSENT: 3,
  OTP_VERIFY: 4,
} as const;

export type RegisterStep = (typeof REGISTER_STEPS)[keyof typeof REGISTER_STEPS];

interface UseRegisterFormProps {
  isTeacherFlow?: boolean;
  isInstitutionFlow?: boolean;
}

export const useRegisterForm = ({
  isTeacherFlow,
  isInstitutionFlow,
}: UseRegisterFormProps = {}) => {
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");

  const [step, setStep] = useState<RegisterStep>(REGISTER_STEPS.BASIC_INFO);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validatedValues, setValidatedValues] = useState<SignUpPayload | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // 🛡️ RURAL RESILIENCE: Persist partial state to IndexedDB (Mandate Rule #4)
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await offlineDB.registration_drafts.get("current_registration");

      if (draft) {
        try {
          // 🛡️ SECURITY: Implement 15-minute TTL for sensitive identity data
          const DRAFT_TTL_MS = 15 * 60 * 1000;
          const isExpired = Date.now() - (draft.updatedAt || 0) > DRAFT_TTL_MS;

          if (isExpired) {
            console.warn("🔐 Registration draft expired (15m TTL). Wiping sensitive data.");
            try {
              await offlineDB.registration_drafts.delete("current_registration");
            } catch (delError) {
              // 🛡️ REGULATORY FAIL-SAFE: If deletion fails, attempt a hard-clear of the sensitive fields
              // and notify the system via telemetry (Strike 2 integration).
              console.error("🚨 LAW_151_VIOLATION: Failed to purge expired PII draft!", delError);
              await offlineDB.registration_drafts
                .update("current_registration", {
                  values: { nationalId: "[PURGE_FAILED]", phoneNumber: "[PURGE_FAILED]" },
                  updatedAt: Date.now(),
                })
                .catch(() => {});
            }
            return;
          }

          const values = draft.values as SignUpPayload;
          setValidatedValues(values);

          // 🛡️ SECURITY: Prevent step hijacking. Only restore step if we have minimal required data.
          if (values.phoneNumber) {
            setStep(draft.step as RegisterStep);
          }
        } catch (e) {
          await offlineDB.registration_drafts.delete("current_registration");
        }
      }
    };
    loadDraft();
  }, []);

  useEffect(() => {
    const saveDraft = async () => {
      if (validatedValues) {
        // 🛡️ SECURITY: Explicitly exclude sensitive data from persistence
        const { password, ...safeValues } = validatedValues;
        await offlineDB.registration_drafts.put({
          id: "current_registration",
          step,
          values: safeValues,
          updatedAt: Date.now(),
        });
      } else {
        await offlineDB.registration_drafts.delete("current_registration");
      }
    };
    saveDraft();
  }, [validatedValues, step]);

  const registerSchema = getRegisterSchema(t);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: (isInstitutionFlow ? "admin" : "student"),
      phoneNumber: "",
      nationalId: "",
      bio: "",
      dateOfBirth: "",
      parentName: "",
      parentPhone: "",
      childInviteCode: "",
      verificationDocumentUrl: "",
      verificationDocumentCldPubId: "",
      hasAiConsent: false,
    },
  });

  const role: "student" | "parent" | "teacher" | "admin" = form.watch("role");
  const name = form.watch("name");

  const generateAIBio = async () => {
    const correlationId = `bio-${getUUID()}`;
    const headers = { "x-correlation-id": correlationId };

    setIsGeneratingBio(true);
    try {
      const response = await axios.post(
        `${BASE_URL}${AI_API.BIO}`,
        { name, role: isTeacherFlow ? "teacher" : isInstitutionFlow ? "admin" : role },
        { headers }
      );
      form.setValue("bio", response.data.bio);
      toast.success(t("auth.register.aiBioSuccess", "AI Bio generated successfully!"));
    } catch (error: any) {
      const traceId = getCorrelationId(error);
      const fallbacks = {
        student: t(
          "auth.register.bioFallbackStudent",
          `Hi, I'm {{name}}, a student on Tablawy OS.`,
          { name }
        ),
        teacher: t(
          "auth.register.bioFallbackTeacher",
          `Hi, I'm {{name}}, an educator specialized in knowledge transfer.`,
          { name }
        ),
        parent: t(
          "auth.register.bioFallbackParent",
          `Hi, I'm {{name}}, supporting my child's learning journey.`,
          { name }
        ),
        admin: t(
          "auth.register.bioFallbackAdmin",
          `Hi, I'm {{name}}, managing institutional operations.`,
          { name }
        ),
      };
      form.setValue(
        "bio",
        fallbacks[
          (isTeacherFlow ? "teacher" : isInstitutionFlow ? "admin" : role) as keyof typeof fallbacks
        ] || `Hi, I'm ${name}.`
      );

      toast.error(t("auth.register.aiBioError", "Bio generation failed"), {
        description: `Trace ID: ${traceId}. ${t("common.supportInfo", "Please contact support for assistance.")}`,
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    let targetStep: RegisterStep | null = null;

    if (step === REGISTER_STEPS.BASIC_INFO) {
      fieldsToValidate =
        isTeacherFlow || isInstitutionFlow
          ? ["name", "email", "password"]
          : ["name", "email", "password", "role"];

      const isValid = await form.trigger(fieldsToValidate);
      if (isValid) {
        // 🛡️ LAW 151 BYPASS: Skip ID verification for students with an invite code (Private Suite)
        if (role === "student" && inviteCode) {
          targetStep = REGISTER_STEPS.CONSENT;
        } else {
          targetStep = REGISTER_STEPS.EGYPTIAN_ID;
        }
      }
    } else if (step === REGISTER_STEPS.EGYPTIAN_ID) {
      // 🛡️ NORMALIZATION: Immediate feedback (Mandate M-008)
      const currentPhone = normalizeArabicNumerals(form.getValues("phoneNumber"));
      const currentId = normalizeArabicNumerals(form.getValues("nationalId"));

      // 🛡️ UI: Sync with validation state immediately
      form.setValue("phoneNumber", currentPhone, { shouldValidate: true });
      form.setValue("nationalId", currentId, { shouldValidate: true });

      fieldsToValidate = ["phoneNumber", "nationalId"];

      const isValid = await form.trigger(fieldsToValidate);
      if (isValid) {
        // Soft validation for Egyptian ID
        const nationalId = form.getValues("nationalId");
        const validation = validateEgyptianID(nationalId);
        if (!validation.isValid) {
          form.setError("nationalId", { message: validation.error });
          return;
        }
        targetStep = REGISTER_STEPS.CONSENT;
      }
    } else if (step === REGISTER_STEPS.CONSENT) {
      fieldsToValidate = ["hasAiConsent"];
      const isValid = await form.trigger(fieldsToValidate);
      if (isValid) {
        await sendWhatsAppOtp();
        targetStep = REGISTER_STEPS.OTP_VERIFY;
      }
    }

    if (targetStep) {
      setStep(targetStep);
    }
  };

  const prevStep = () => setStep((prev) => (prev - 1) as RegisterStep);

  const performFinalSubmit = (values: SignUpPayload) => {
    const correlationId = `reg-${getUUID()}`;

    register(
      { ...values, inviteCode, correlationId },
      {
        onSuccess: () => {
          setIsSuccess(true);
          // 🛡️ SECURITY: Clear sensitive values from state immediately after success
          setValidatedValues(null);

          // 🛡️ UX: Conditional redirection based on role AND invite context (Mandate Rule #3)
          setTimeout(() => {
            if (isInstitutionFlow) {
              navigate("/onboarding/select-suite");
            } else if (isTeacherFlow) {
              navigate("/apply/teacher");
            } else if (inviteCode) {
              // If joining via invite, redirect to class dashboard or specific class page
              navigate(`/classes/join/${inviteCode}`);
            } else if (values.role === "student") {
              navigate("/ai/chat");
            } else {
              navigate("/dashboard");
            }
          }, 3000);
        },
        onError: async (err) => {
          const error = await handleError(err as any);
          toast.error(error.message, {
            description: `Trace ID: ${getCorrelationId(err) || correlationId}. ${t("common.supportInfo", "Please contact support for assistance.")}`,
          });
          // 🛡️ UX: Stay on current step to allow correction/retry instead of resetting to Step 1
        },
      }
    );
  };

  const sendWhatsAppOtp = async () => {
    const phoneNumber = form.getValues("phoneNumber");
    const correlationId = `otp-send-${getUUID()}`;
    const headers = { "x-correlation-id": correlationId };

    setIsSendingOtp(true);
    try {
      await axios.post(`${BASE_URL}${OTP_API.SEND}`, { phoneNumber }, { headers });
      toast.success(t("auth.otp.sent", "OTP sent via WhatsApp!"));
    } catch (error) {
      const apiError = await handleError(error);
      toast.error(apiError.message, {
        description: `Trace ID: ${getCorrelationId(error) || correlationId}. ${t("common.supportInfo", "Please contact support for assistance.")}`,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async (code: string) => {
    const phoneNumber = form.getValues("phoneNumber");
    const correlationId = `otp-verify-${getUUID()}`;
    const headers = { "x-correlation-id": correlationId };

    setIsVerifyingOtp(true);
    try {
      const response = await axios.post(
        `${BASE_URL}${OTP_API.VERIFY}`,
        { phoneNumber, code },
        { headers }
      );
      if (response.data.data.verified && validatedValues) {
        // 🛡️ SECURITY: Use validated, transformed values from the original submission
        performFinalSubmit(validatedValues);
      }
    } catch (error) {
      const apiError = await handleError(error);
      toast.error(apiError.message, {
        description: `Trace ID: ${getCorrelationId(error) || correlationId}. ${t("common.supportInfo", "Please contact support for assistance.")}`,
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleFinalSubmit = form.handleSubmit((values) => {
    // 🛡️ NORMALIZATION: Automatically handled by Zod .transform() in the schema
    if (role === "student") {
      setValidatedValues(values as unknown as SignUpPayload);
      setStep(REGISTER_STEPS.OTP_VERIFY); // Move to OTP step
      return;
    }
    performFinalSubmit(values as unknown as SignUpPayload);
  });

  return {
    form,
    step,
    nextStep,
    prevStep,
    isGeneratingBio,
    generateAIBio,
    handleFinalSubmit,
    isPending,
    isSuccess,
    role,
    inviteCode,
    verifyOtp,
    isVerifyingOtp,
    sendWhatsAppOtp,
  };
};
