import { useState, useEffect } from "react";
import { HttpError, useRegister } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { validateEgyptianID } from "@/lib/validators";

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
    name: z.string().min(1, t("auth.register.nameRequired", "Name is required")),
    email: z.string().email(t("auth.register.invalidEmail", "Invalid email")),
    password: z
      .string()
      .min(8, t("auth.register.passwordMinLength", "Password must be at least 8 characters")),
    role: z.enum(["student", "teacher", "parent"]),
    phoneNumber: z.string().min(10, t("auth.register.phoneRequired", "Phone number is required")),
    nationalId: z
      .string()
      .length(14, t("auth.register.nationalIdLength", "National ID must be 14 digits")),
    hasAiConsent: z.boolean().refine((val) => val === true, {
      message: t("auth.register.consentRequired", "AI consent is required"),
    }),
    bio: z.string().optional(),
    dateOfBirth: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: z.string().optional(),
    childInviteCode: z.string().optional(),
    verificationDocumentUrl: z.string().optional(),
    verificationDocumentCldPubId: z.string().optional(),
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
      hasAiConsent: false,
      bio: "",
      dateOfBirth: "",
      parentName: "",
      parentPhone: "",
      childInviteCode: "",
      verificationDocumentUrl: "",
      verificationDocumentCldPubId: "",
    },
    shouldUnregister: false,
  });

  const role = form.watch("role");

  useEffect(() => {
    if (inviteCode) {
      toast.info(t("classes.show.toast.inviteLinkDetected"), {
        description: t("classes.show.toast.registerToJoin"),
      });
    }
  }, [inviteCode, t]);

  const generateAIBio = async () => {
    const name = form.getValues("name");
    if (!name) {
      toast.error(t("auth.register.enterNameFirst"));
      return;
    }

    setIsGeneratingBio(true);
    try {
      const response = await axios.post<{ content: string }>("/api/ai/generate-content", {
        prompt: `Generate a professional bio for a ${role} named ${name}. Keywords: passionate, experienced, dedicated. Keep it under 50 words.`,
        context: "User Registration Bio",
      });

      form.setValue("bio", response.data.content);
      toast.success(t("auth.register.aiBioGenerated"));
    } catch {
      const fallbacks: Record<string, string> = {
        teacher: `Hello, I'm ${name}. I am a dedicated educator committed to fostering a positive and engaging learning environment for all my students.`,
        student: `Hi, I'm ${name}. I'm an enthusiastic student eager to learn and grow in my academic journey.`,
        parent: `Hello, I'm ${name}. I am a supportive parent dedicated to my child's educational success and well-being.`,
      };
      form.setValue("bio", fallbacks[role as keyof typeof fallbacks] || `Hi, I'm ${name}.`);
      toast.info(t("auth.register.aiBioFallback"));
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["name", "email", "password", "role"];
    } else if (step === 2) {
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
    const phoneNumber = form.getValues("phoneNumber");
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
    const phoneNumber = form.getValues("phoneNumber");
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
    register(
      { ...values, inviteCode },
      {
        onSuccess: () => {
          setIsSuccess(true);
          // Redirect logic based on role for "First Success"
          setTimeout(() => {
            if (values.role === "teacher") navigate("/ai/magic-builder");
            else if (values.role === "student") navigate("/ai/chat");
            else navigate("/dashboard");
          }, 3000);
        },
        onError: (err) => {
          const error = err as HttpError;
          const errorMessage =
            (error as any)?.data?.message || error.message || t("auth.login.unknownError");
          toast.error(errorMessage);
          setStep(1); // Reset to first step on hard error
        },
      }
    );
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
