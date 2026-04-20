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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleSelector } from "@/features/auth/components/role-selector";
import { VerificationUpload } from "@/features/auth/components/verification-upload";
import { ConsentHub } from "@/features/auth/components/consent-hub";
import { OtpVerification } from "@/features/auth/components/otp-verification";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Hook
import { useRegisterForm, REGISTER_STEPS } from "@/features/auth/hooks/useRegisterForm";

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const {
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
  } = useRegisterForm();

  const renderStepLabel = () => {
    switch (step) {
      case 1:
        return t("auth.register.accountSetup", "Account Setup");
      case 2:
        return t("auth.register.profileDetails", "Profile Details");
      case 3:
        return t("auth.register.dataCompliance", "Data Compliance");
      case 4:
        return t("auth.register.verification", "Verification");
      default:
        return "";
    }
  };

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
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center text-center space-y-8 py-20"
            >
              <div className="relative text-start">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                  className="bg-primary p-8 rounded-[3rem] shadow-2xl shadow-primary/40 relative z-10 text-primary-foreground"
                >
                  <CheckCircle2 className="h-20 w-20" />
                </motion.div>
                <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse rounded-full" />
              </div>
              <div className="space-y-3">
                <h2 className="text-5xl font-black tracking-tighter uppercase leading-tight">
                  Welcome Aboard!
                </h2>
                <p className="text-xl text-muted-foreground font-medium max-w-sm mx-auto">
                  Your classroom is ready. Preparing your cinematic experience...
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  Syncing Neural Engine
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-10 md:space-y-14">
              <Link to="/" className="flex items-center justify-center gap-3 group">
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
                    {t("auth.register.stepOf", {
                      step,
                      label: renderStepLabel(),
                    })}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight">
                      {step === REGISTER_STEPS.OTP_VERIFY
                        ? t("auth.register.verifyTitle", "Verify Identity")
                        : t("auth.register.title")}
                    </CardTitle>
                    <CardDescription className="font-medium text-base md:text-lg px-4 md:px-8">
                      {step === REGISTER_STEPS.OTP_VERIFY
                        ? t("auth.register.verifyDesc", "One final step to secure your account.")
                        : t("auth.register.description")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="px-6 md:px-12">
                  <Form {...form}>
                    <div className="space-y-6 md:space-y-8">
                      <AnimatePresence mode="wait">
                        {step === REGISTER_STEPS.BASIC_INFO ? (

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
                                  <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                    {t("profile.labels.role")}
                                  </FormLabel>
                                  <FormControl>
                                    <RoleSelector
                                      value={field.value as "student" | "teacher" | "parent"}
                                      onChange={(val) => field.onChange(val)}
                                    />
                                  </FormControl>
                                  <FormMessage className="ms-2 font-bold" />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                      {t("auth.register.fullNameLabel")}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={t("auth.register.fullNamePlaceholder")}
                                        className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage className="ms-2 font-bold" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                      {t("auth.register.emailLabel")}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="email"
                                        placeholder={t("auth.register.emailPlaceholder")}
                                        className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage className="ms-2 font-bold" />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                    {t("auth.register.passwordLabel")}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder={t("auth.register.passwordPlaceholder")}
                                      className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage className="ms-2 font-bold" />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        ) : step === REGISTER_STEPS.EGYPTIAN_ID ? (

                          <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: isAr ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isAr ? 20 : -20 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="space-y-6 md:space-y-8"
                          >
                            <div className="p-5 rounded-[1.5rem] bg-primary/5 border border-primary/10 shadow-sm text-start">
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
                                  <FormItem className="space-y-3 text-start">
                                    <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                      {t("auth.register.phoneNumberLabel")}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={t("auth.register.phoneNumberPlaceholder")}
                                        className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage className="ms-2 font-bold" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="nationalId"
                                render={({ field }) => (
                                  <FormItem className="space-y-3 text-start">
                                    <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                      {t("auth.register.nationalIdLabel", "National ID")}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        maxLength={14}
                                        placeholder="2900101XXXXXXXX"
                                        className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription className="ms-2 text-[10px] font-medium opacity-60">
                                      Used only for identity verification (Law 151).
                                    </FormDescription>
                                    <FormMessage className="ms-2 font-bold" />
                                  </FormItem>
                                )}
                              />
                              {role === "student" && (
                                <FormField
                                  control={form.control}
                                  name="dateOfBirth"
                                  render={({ field }) => (
                                    <FormItem className="space-y-3 text-start">
                                      <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                        {t("auth.register.dobLabel")}
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="date"
                                          className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black focus-visible:ring-primary/20 appearance-none"
                                          {...field}
                                          value={field.value || ""}
                                        />
                                      </FormControl>

                                      <FormMessage className="ms-2 font-bold" />
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
                                      <FormItem className="space-y-3 text-start">
                                        <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                          {t("auth.register.fullNameLabel")}
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder={t("auth.register.fullNamePlaceholder")}
                                            className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                            {...field}
                                            value={field.value || ""}
                                          />
                                        </FormControl>
                                        <FormMessage className="ms-2 font-bold" />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="parentPhone"
                                    render={({ field }) => (
                                      <FormItem className="space-y-3 text-start">
                                        <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                          {t("auth.register.phoneNumberLabel")}
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder={t("auth.register.phoneNumberPlaceholder")}
                                            className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                            {...field}
                                            value={field.value || ""}
                                          />
                                        </FormControl>
                                        <FormMessage className="ms-2 font-bold" />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="childInviteCode"
                                    render={({ field }) => (
                                      <FormItem className="space-y-3 col-span-1 md:col-span-2 text-start">
                                        <div className="flex items-center gap-2 ms-2">
                                          <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-primary">
                                            Child's Invite Code
                                          </FormLabel>
                                          <Badge
                                            variant="outline"
                                            className="h-5 px-2 rounded-md text-[8px] bg-primary/5 text-primary border-primary/20"
                                          >
                                            Optional
                                          </Badge>
                                        </div>
                                        <FormControl>
                                          <Input
                                            placeholder="e.g. STU-XXXX-XXXX"
                                            className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-primary/5 border-2 border-primary/10 px-6 md:px-8 text-base md:text-lg font-mono font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) =>
                                              field.onChange(e.target.value.toUpperCase())
                                            }
                                          />
                                        </FormControl>
                                        <FormDescription className="ms-2 text-[10px] font-medium text-muted-foreground/60">
                                          Link your child's account immediately to see their
                                          progress.
                                        </FormDescription>
                                        <FormMessage className="ms-2 font-bold" />
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
                                    <FormItem className="space-y-3 text-start">
                                      <div className="flex justify-between items-center">
                                        <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                          {t("auth.register.bioLabel")}
                                        </FormLabel>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-9 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-xl gap-2"
                                          onClick={generateAIBio}
                                          disabled={isGeneratingBio}
                                        >
                                          {isGeneratingBio ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : (
                                            <Sparkles className="h-3.5 w-3.5" />
                                          )}
                                          {t("buttons.aiAssist")}
                                        </Button>
                                      </div>
                                      <FormControl>
                                        <Textarea
                                          placeholder={t("auth.register.bioPlaceholder")}
                                          className="min-h-32 md:min-h-40 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-medium p-6 resize-none focus-visible:ring-primary/20 leading-relaxed italic"
                                          {...field}
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage className="ms-2 font-bold" />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="verificationDocumentUrl"
                                  render={({ field }) => (
                                    <FormItem className="space-y-3 text-start">
                                      <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                                        {t("auth.register.verification.uploadLabel")}
                                      </FormLabel>
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
                                      <CardDescription className="ms-2 text-xs md:text-sm text-muted-foreground/70">
                                        {t("auth.register.verification.success")}
                                      </CardDescription>
                                      <FormMessage className="ms-2 font-bold" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </motion.div>
                        ) : step === REGISTER_STEPS.CONSENT ? (

                          <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: isAr ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isAr ? 20 : -20 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          >
                            <FormField
                              control={form.control}
                              name="hasAiConsent"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <ConsentHub
                                      isConsented={field.value}
                                      onConsentChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage className="ms-2 font-bold" />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <OtpVerification
                              phoneNumber={form.getValues("phoneNumber")}
                              isVerifying={isVerifyingOtp}
                              onVerify={verifyOtp}
                              onResend={sendWhatsAppOtp}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-6">
                        {step > 1 && step < 4 ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm border-2 border-border/40 bg-background/50 shadow-sm"
                            onClick={prevStep}
                          >
                            <ArrowLeft
                              className={cn("h-4 w-4 me-2", isAr && "ms-2 me-0 rotate-180")}
                            />
                            {t("buttons.back")}
                          </Button>
                        ) : step === 4 ? null : (
                          <Link
                            to={`/login${inviteCode ? `?inviteCode=${inviteCode}` : ""}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full h-14 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm border-2 border-border/40 bg-background/50 shadow-sm"
                            >
                              <ArrowLeft
                                className={cn("h-4 w-4 me-2", isAr && "ms-2 me-0 rotate-180")}
                              />
                              {t("buttons.signIn")}
                            </Button>
                          {step > REGISTER_STEPS.BASIC_INFO && step < REGISTER_STEPS.OTP_VERIFY ? (
                          ...
                          {step < REGISTER_STEPS.OTP_VERIFY ? (
                            <Button
                              type="button"
                              size="lg"
                              className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl shadow-primary/30 group"
                              onClick={nextStep}
                            >
                              {step === REGISTER_STEPS.CONSENT ? t("buttons.getOtp", "Get Code") : t("buttons.continue")}

                            <ArrowRight
                              className={cn(
                                "h-4 w-4 ms-2 group-hover:translate-x-1 transition-transform",
                                isAr && "me-2 ms-0 rotate-180 group-hover:-translate-x-1"
                              )}
                            />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center py-8 md:py-12 bg-primary/2 border-t border-border/40 mt-8">
                  <p className="text-sm md:text-base font-medium text-muted-foreground/80">
                    {t("auth.register.alreadyHaveAccount")}&nbsp;
                    <Link
                      to={`/login${inviteCode ? `?inviteCode=${inviteCode}` : ""}`}
                      className="font-black text-primary hover:underline uppercase tracking-[0.1em] text-xs md:text-sm"
                    >
                      {t("buttons.signIn")}
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
