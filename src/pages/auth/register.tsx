import { useRegister } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { 
  School, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Loader2,
  BookOpen,
  Zap,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { RoleSelector } from "@/components/auth/role-selector";
import { VerificationUpload } from "@/components/auth/verification-upload";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");
  
  const [step, setStep] = useState(1);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

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
    verificationDocumentUrl: z.string().optional(),
    verificationDocumentCldPubId: z.string().optional(),
  });

  const form = useForm<z.infer<typeof registerSchema>>({
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
      verificationDocumentUrl: "",
      verificationDocumentCldPubId: "",
    },
    shouldUnregister: false,
  });

  const role = form.watch("role");

  useEffect(() => {
    if (inviteCode) {
        toast.info(t("classes.show.toast.inviteLinkDetected"), {
            description: t("classes.show.toast.registerToJoin")
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
      const response = await axios.post("/api/ai/generate-content", {
        prompt: `Generate a professional bio for a ${role} named ${name}. Keywords: passionate, experienced, dedicated. Keep it under 50 words.`,
        context: "User Registration Bio"
      });
      
      form.setValue("bio", response.data.content);
      toast.success(t("auth.register.aiBioGenerated"));
    } catch (error) {
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
    const fieldsToValidate = ["name", "email", "password", "role"];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep(2);
  };

  const handleFinalSubmit = () => {
    form.handleSubmit((values) => {
      register({ ...values, inviteCode }, {
        onSuccess: () => {
          const successMsg = values.role === "teacher" 
            ? t("auth.register.registrationSuccessTeacher")
            : t("auth.register.registrationSuccess");
          toast.success(successMsg);
          navigate("/login");
        },
        onError: (error: any) => {
          const errorMessage =
            error?.data?.message || error.message || t("auth.login.unknownError");
          toast.error(errorMessage);
        },
      });
    })();
  };

  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Immersive Background - Mobile Optimized */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] start-[-10%] w-[60%] h-[40%] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] end-[-10%] w-[60%] h-[40%] bg-purple-500/10 blur-[80px] md:blur-[120px] rounded-full opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-xl z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-10 md:mb-14 group">
          <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-primary/20">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase leading-none">
            Class<span className="text-primary italic">Room</span>
          </span>
        </Link>

        <Card className="border-border/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden">
          <CardHeader className="text-center pt-10 md:pt-14 pb-6 md:pb-10 space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mx-auto border border-primary/10">
                <Sparkles className="h-3.5 w-3.5" />
                {t("auth.register.stepOf", { step, label: step === 1 ? t("auth.register.accountSetup") : t("auth.register.profileDetails") })}
            </div>
            <div className="space-y-2">
                <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight">{t("auth.register.title")}</CardTitle>
                <CardDescription className="font-medium text-base md:text-lg px-4 md:px-8">
                {t("auth.register.description")}
                </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 md:px-12">
            <Form {...form}>
              <div className="space-y-6 md:space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="space-y-6 md:space-y-8"
                    >
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("profile.labels.role")}</FormLabel>
                            <FormControl>
                              <RoleSelector 
                                value={field.value as "student" | "teacher" | "parent"}
                                onChange={(val) => field.onChange(val)} 
                              />
                            </FormControl>
                            <FormMessage className="ml-2 font-bold" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.fullNameLabel")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("auth.register.fullNamePlaceholder")} className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20" {...field} />
                              </FormControl>
                              <FormMessage className="ml-2 font-bold" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.emailLabel")}</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder={t("auth.register.emailPlaceholder")} className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20" {...field} />
                              </FormControl>
                              <FormMessage className="ml-2 font-bold" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.passwordLabel")}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder={t("auth.register.passwordPlaceholder")} className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20" {...field} />
                            </FormControl>
                            <FormMessage className="ml-2 font-bold" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: isAr ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isAr ? 20 : -20 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="space-y-6 md:space-y-8"
                    >
                      <div className="p-5 rounded-[1.5rem] bg-primary/5 border border-primary/10 shadow-sm">
                        <p className="text-xs md:text-sm text-muted-foreground font-black uppercase tracking-widest leading-relaxed flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          {t("auth.register.completeProfileTip")}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.phoneNumberLabel")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("auth.register.phoneNumberPlaceholder")} className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20" {...field} />
                              </FormControl>
                              <FormMessage className="ml-2 font-bold" />
                            </FormItem>
                          )}
                        />
                        {role === "student" && (
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.dobLabel")}</FormLabel>
                                <FormControl>
                                  <Input type="date" className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20" {...field} />
                                </FormControl>
                                <FormMessage className="ml-2 font-bold" />
                              </FormItem>
                            )}
                          />
                        )}
                        {role === "parent" && (
                          <>
                            <FormField
                              control={form.control}
                              name="parentName"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.fullNameLabel")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("auth.register.fullNamePlaceholder")} className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20" {...field} />
                                  </FormControl>
                                  <FormMessage className="ml-2 font-bold" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="parentPhone"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.phoneNumberLabel")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("auth.register.phoneNumberPlaceholder")} className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20" {...field} />
                                  </FormControl>
                                  <FormMessage className="ml-2 font-bold" />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>

                      {role === "teacher" && (
                        <div className="space-y-6 md:space-y-8">
                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.bioLabel")}</FormLabel>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-9 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-xl gap-2"
                                    onClick={generateAIBio}
                                    disabled={isGeneratingBio}
                                  >
                                    {isGeneratingBio ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                    {t("buttons.aiAssist")}
                                  </Button>
                                </div>
                                <FormControl>
                                  <Textarea placeholder={t("auth.register.bioPlaceholder")} className="min-h-32 md:min-h-40 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-medium p-6 resize-none focus-visible:ring-primary/20 leading-relaxed italic" {...field} />
                                </FormControl>
                                <FormMessage className="ml-2 font-bold" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="verificationDocumentUrl"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ml-2">{t("auth.register.verification.uploadLabel")}</FormLabel>
                                <FormControl>
                                  <VerificationUpload 
                                    url={field.value || ""}
                                    onUpload={(url, publicId) => {
                                      field.onChange(url);
                                      form.setValue("verificationDocumentCldPubId", publicId);
                                    }}
                                    onClear={() => {
                                      field.onChange("");
                                      form.setValue("verificationDocumentCldPubId", "");
                                    }}
                                  />
                                </FormControl>
                                <CardDescription className="ml-2 text-xs md:text-sm text-muted-foreground/70">
                                    {t("auth.register.verification.success")}
                                </CardDescription>
                                <FormMessage className="ml-2 font-bold" />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-6">
                  {step > 1 ? (
                    <Button type="button" variant="outline" size="lg" className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm border-2 border-border/40 bg-background/50 shadow-sm" onClick={() => setStep(1)}>
                      <ArrowLeft className={cn("h-4 w-4 mr-2", isAr && "ml-2 mr-0 rotate-180")} />
                      {t("buttons.back")}
                    </Button>
                  ) : (
                    <Link to={`/login${inviteCode ? `?inviteCode=${inviteCode}` : ''}`} className="flex-1">
                      <Button variant="outline" size="lg" className="w-full h-14 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm border-2 border-border/40 bg-background/50 shadow-sm">
                        <ArrowLeft className={cn("h-4 w-4 mr-2", isAr && "ml-2 mr-0 rotate-180")} />
                        {t("buttons.signIn")}
                      </Button>
                    </Link>
                  )}
                  {step < 2 ? (
                    <Button type="button" size="lg" className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl shadow-primary/30 group" onClick={nextStep}>
                      {t("buttons.continue")}
                      <ArrowRight className={cn("h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform", isAr && "mr-2 ml-0 rotate-180 group-hover:-translate-x-1")} />
                    </Button>
                  ) : (
                    <Button type="button" size="lg" className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl shadow-primary/30 group" disabled={isPending} onClick={handleFinalSubmit}>
                      {isPending ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {t("buttons.authenticating")}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                            {t("buttons.completeJoin")}
                            <Zap className={cn("h-5 w-5 fill-current group-hover:scale-125 transition-transform", isAr && "rotate-180")} />
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center py-8 md:py-12 bg-primary/[0.02] border-t border-border/40 mt-8">
            <p className="text-sm md:text-base font-medium text-muted-foreground/80">
              {t("auth.register.alreadyHaveAccount")}&nbsp;
              <Link to={`/login${inviteCode ? `?inviteCode=${inviteCode}` : ''}`} className="font-black text-primary hover:underline uppercase tracking-[0.1em] text-xs md:text-sm">{t("buttons.signIn")}</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
