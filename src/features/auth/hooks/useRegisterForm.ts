import { useState, useEffect } from "react";
import { HttpError, useRegister } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { validateEgyptianID, normalizeArabicNumerals, egyptNumericSchema } from "@/lib/validators";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { SignUpPayload } from "@/types";
import { getUUID } from "@/lib/utils";

export const REGISTER_STEPS = {
  BASIC_INFO: 1,
  EGYPTIAN_ID: 2,
  CONSENT: 3,
  OTP_VERIFY: 4,
} as const;

export const useRegisterForm = () => {
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");

  const [step, setStep] = useState(REGISTER_STEPS.BASIC_INFO);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validatedValues, setValidatedValues] = useState<SignUpPayload | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // 🛡️ RURAL RESILIENCE: Persist partial state to sessionStorage (Mandate Rule #4)
  useEffect(() => {
    const saved = sessionStorage.getItem("registration_pending_values");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setValidatedValues(parsed);
        // If we have saved values, we were likely on the OTP step
        setStep(REGISTER_STEPS.OTP_VERIFY);
      } catch (e) {
        sessionStorage.removeItem("registration_pending_values");
      }
    }
  }, []);

  useEffect(() => {
    if (validatedValues) {
      sessionStorage.setItem("registration_pending_values", JSON.stringify(validatedValues));
    } else {
      sessionStorage.removeItem("registration_pending_values");
    }
  }, [validatedValues]);

  const registerSchema = z.object({
    name: z.string().min(3, t("auth.register.nameMin", "Name must be at least 3 characters")),
    email: z.string().email(t("auth.register.emailInvalid", "Invalid email address")),
    password: z
      .string()
      .min(8, t("auth.register.passwordMin", "Password must be at least 8 characters")),
    role: z.enum(["student", "teacher", "parent"]),
    phoneNumber: egyptNumericSchema.pipe(
      z.string().min(10, t("auth.register.phoneRequired", "Phone number is required"))
    ),
    nationalId: egyptNumericSchema.pipe(
      z.string().length(14, t("auth.register.nationalIdLength", "National ID must be 14 digits"))
    ),
    bio: z.string().optional(),
    dateOfBirth: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: egyptNumericSchema.optional().or(z.string().length(0)).or(z.null()),
    childInviteCode: z.string().optional(),
    verificationDocumentUrl: z.string().optional(),
    verificationDocumentCldPubId: z.string().optional(),
    hasAiConsent: z.boolean().refine((val) => val === true, {
      message: t("auth.register.consentRequired", "AI Consent is required"),
    }),
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
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

  const role = form.watch("role");
  const name = form.watch("name");

  const generateAIBio = async () => {
    const correlationId = `bio-${getUUID()}`;
    const headers = { "x-correlation-id": correlationId };

    setIsGeneratingBio(true);
    try {
      const response = await axios.post("/api/ai/generate-bio", { name, role }, { headers });
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
      };
      form.setValue("bio", fallbacks[role as keyof typeof fallbacks] || `Hi, I'm ${name}.`);

      toast.error(t("auth.register.aiBioError", "Bio generation failed"), {
        description: `Trace ID: ${traceId}. ${t("common.supportInfo", "Please contact support for assistance.")}`,
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === REGISTER_STEPS.BASIC_INFO) {
      fieldsToValidate = ["name", "email", "password", "role"];
    } else if (step === REGISTER_STEPS.EGYPTIAN_ID) {
      // 🛡️ NORMALIZATION: Immediate feedback (Mandate M-008)
      const currentPhone = normalizeArabicNumerals(form.getValues("phoneNumber"));
      const currentId = normalizeArabicNumerals(form.getValues("nationalId"));
      form.setValue("phoneNumber", currentPhone);
      form.setValue("nationalId", currentId);

      fieldsToValidate = ["phoneNumber", "nationalId"];
      // Soft validation for Egyptian ID
      const nationalId = form.getValues("nationalId");
      const validation = validateEgyptianID(nationalId);
      if (!validation.isValid) {
        form.setError("nationalId", { message: validation.error });
        return;
      }
    } else if (step === REGISTER_STEPS.CONSENT) {
      fieldsToValidate = ["hasAiConsent"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (step === REGISTER_STEPS.CONSENT) {
        await sendWhatsAppOtp();
      }
      setStep((prev) => (prev + 1) as any);
    }
  };

  const prevStep = () => setStep((prev) => (prev - 1) as any);

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
            if (inviteCode) {
              // If joining via invite, redirect to class dashboard or specific class page
              navigate(`/classes/join/${inviteCode}`);
            } else if (values.role === "teacher") {
              navigate("/ai/magic-builder");
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
      await axios.post("/api/auth/otp/send", { phoneNumber }, { headers });
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
      const response = await axios.post("/api/auth/otp/verify", { phoneNumber, code }, { headers });
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
      setValidatedValues(values as SignUpPayload);
      setStep(REGISTER_STEPS.OTP_VERIFY); // Move to OTP step
      return;
    }
    performFinalSubmit(values as SignUpPayload);
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
