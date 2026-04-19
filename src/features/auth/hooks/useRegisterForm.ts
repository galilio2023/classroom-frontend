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

export const useRegisterForm = () => {
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");

  const [step, setStep] = useState(1);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const registerSchema = z.object({
    name: z.string().min(3, t("auth.register.nameMin", "Name must be at least 3 characters")),
    email: z.string().email(t("auth.register.emailInvalid", "Invalid email address")),
    password: z
      .string()
      .min(8, t("auth.register.passwordMin", "Password must be at least 8 characters")),
    role: z.enum(["student", "teacher", "parent"]),
    phoneNumber: z.string().min(10, t("auth.register.phoneRequired", "Phone number is required")),
    nationalId: z
      .string()
      .length(14, t("auth.register.nationalIdLength", "National ID must be 14 digits")),
    bio: z.string().optional(),
    dateOfBirth: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: z.string().optional(),
    childInviteCode: z.string().optional(),
    hasAiConsent: z.boolean().refine((val) => val === true, {
      message: t("auth.register.consentRequired", "AI Consent is required"),
    }),
  });

  const form = useForm<z.infer<typeof registerSchema>>({
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
      hasAiConsent: false,
    },
  });

  const role = form.watch("role");
  const name = form.watch("name");

  // 🛡️ TRACEABILITY: Extract correlation ID from headers for support visibility (Mandate Rule 8)
  const getTraceId = (error: any) => error?.response?.headers?.["x-correlation-id"] || "N/A";

  const generateAIBio = async () => {
    setIsGeneratingBio(true);
    try {
      const response = await axios.post("/api/ai/generate-bio", {
        name,
        role,
      });
      form.setValue("bio", response.data.bio);
      toast.success(t("auth.register.aiBioSuccess"));
    } catch (error: any) {
      const traceId = getTraceId(error);
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
        description: `Trace ID: ${traceId}. ${t("common.supportInfo")}`,
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["name", "email", "password", "role"];
    } else if (step === 2) {
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
    } else if (step === 3) {
      fieldsToValidate = ["hasAiConsent"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (step === 3) {
        await sendWhatsAppOtp();
      }
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const sendWhatsAppOtp = async () => {
    const phoneNumber = normalizeArabicNumerals(form.getValues("phoneNumber"));
    setIsSendingOtp(true);
    try {
      await axios.post("/api/auth/otp/send", { phoneNumber });
      toast.success(t("auth.otp.sentSuccess", "OTP sent via WhatsApp"));
    } catch (error) {
      toast.error(t("auth.otp.sentError", "Failed to send OTP. Please try again."));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async (code: string) => {
    const phoneNumber = normalizeArabicNumerals(form.getValues("phoneNumber"));
    setIsVerifyingOtp(true);
    try {
      const response = await axios.post("/api/auth/otp/verify", { phoneNumber, code });
      if (response.data.data.verified) {
        handleFinalSubmit();
      }
    } catch (error) {
      toast.error(t("auth.otp.invalid", "Invalid verification code."));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleFinalSubmit = form.handleSubmit((values) => {
    const normalizedValues = {
      ...values,
      phoneNumber: normalizeArabicNumerals(values.phoneNumber),
      nationalId: normalizeArabicNumerals(values.nationalId),
      inviteCode,
    };
    register(normalizedValues, {
      onSuccess: () => {
        setIsSuccess(true);
        // Redirect logic based on role for "First Success"
        setTimeout(() => {
          if (values.role === "teacher") navigate("/ai/magic-builder");
          else if (values.role === "student") navigate("/ai/chat");
          else navigate("/dashboard");
        }, 3000);
      },
      onError: async (err) => {
        const error = await handleError(err as any);
        toast.error(error.message, {
          description: `Trace ID: ${getTraceId(err)}. ${t("common.supportInfo")}`,
        });
        setStep(1); // Reset to first step on hard error
      },
    });
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
