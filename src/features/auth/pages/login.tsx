import { HttpError, useLogin } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";
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
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { InviteBanner } from "../components/invite-banner";

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");

  const loginSchema = z.object({
    email: z.string().email(t("auth.login.invalidEmail")),
    password: z.string().min(1, t("auth.login.passwordRequired")),
  });

  const { mutate: login, isPending } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login(
      { ...values, inviteCode },
      {
        onSuccess: () => {},
        onError: (err) => {
          const error = err as HttpError;
          const errorMessage =
            (error as any)?.data?.message || error.message || t("auth.login.unknownError");
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in with Google");
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {inviteCode && <InviteBanner inviteCode={inviteCode} />}
      {/* Immersive Background Optimized */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] start-[-10%] w-[60%] h-[40%] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] end-[-10%] w-[60%] h-[40%] bg-purple-500/10 blur-[80px] md:blur-[120px] rounded-full opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-10 md:mb-14 group">
          <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-primary/20">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase leading-none">
            Tablawy <span className="text-primary italic">OS</span>
          </span>
        </Link>

        <Card className="border-border/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden">
          <CardHeader className="text-center pt-10 md:pt-14 pb-6 md:pb-10 space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mx-auto border border-primary/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("auth.login.secureAccess")}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight">
                {t("auth.login.title")}
              </CardTitle>
              <CardDescription className="font-medium text-base md:text-lg px-4 md:px-8">
                {t("auth.login.description")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 md:px-12">
            <div className="space-y-6 md:space-y-8 mb-8">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full h-14 md:h-16 rounded-2xl md:rounded-3xl border-border/60 bg-muted/20 hover:bg-muted/40 font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 transition-all duration-300"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t("auth.login.continueWithGoogle")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                  <span className="bg-background px-4 text-muted-foreground/40">
                    {t("auth.login.orDivider")}
                  </span>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 ms-2">
                        {t("auth.login.emailLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          data-testid="email-input"
                          placeholder={t("auth.login.emailPlaceholder")}
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
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex justify-between items-center ms-2">
                        <FormLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60">
                          {t("auth.login.passwordLabel")}
                        </FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-[10px] font-black uppercase tracking-[0.1em] text-primary hover:underline"
                        >
                          {t("auth.login.forgotPassword")}
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          data-testid="password-input"
                          placeholder={t("auth.login.passwordPlaceholder")}
                          className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-muted/30 border-none shadow-inner px-6 md:px-8 text-base md:text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="ms-2 font-bold" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  data-testid="login-submit"
                  size="lg"
                  className="w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-4xl font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl shadow-primary/30 group transition-all duration-300"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("buttons.authenticating")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {t("buttons.signIn")}
                      <Zap
                        className={cn(
                          "h-5 w-5 fill-current group-hover:scale-125 transition-transform",
                          isAr && "rotate-180"
                        )}
                      />
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center py-10 md:py-14 bg-primary/2 border-t border-border/40 mt-8">
            <p className="text-sm md:text-base font-medium text-muted-foreground/80">
              {t("auth.login.newToClassroom")}&nbsp;
              <Link
                to={`/register${inviteCode ? `?inviteCode=${inviteCode}` : ""}`}
                className="font-black text-primary hover:underline uppercase tracking-[0.1em] text-xs md:text-sm"
              >
                {t("buttons.createAccount")}{" "}
                <ArrowRight
                  className={cn("inline h-4 w-4 ms-1 mb-0.5", isAr && "me-1 ms-0 rotate-180")}
                />
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
