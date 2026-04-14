import { useState, useEffect } from "react";
import { HttpError, useRegister } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useTranslation } from "react-i18next";

export const useRegisterForm = () => {
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");

  const [step, setStep] = useState(1);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const registerSchema = z.object({
    name: z.string().min(1, t("auth.register.nameRequired")),
    email: z.string().email(t("auth.register.invalidEmail")),
    password: z.string().min(8, t("auth.register.passwordMinLength")),
    role: z.enum(["student", "teacher", "parent"]),
    phoneNumber: z.string().optional(),
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
    const fieldsToValidate = ["name", "email", "password", "role"] as const;
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleFinalSubmit = form.handleSubmit((values) => {
    register(
      { ...values, inviteCode },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        },
        onError: (err) => {
          const error = err as HttpError;
          const errorMessage =
            (error as any)?.data?.message || error.message || t("auth.login.unknownError");
          toast.error(errorMessage);
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
  };
};
