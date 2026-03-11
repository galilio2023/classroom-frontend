import { useLogin } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpen, Zap, ArrowRight, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
  const { mutate: login, isPending } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login(values, {
      onSuccess: () => {
        // Redirect is handled by the authProvider
      },
      onError: (error: any) => {
        const errorMessage =
          error?.data?.message || error.message || "An unknown error occurred.";
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-12 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Class<span className="text-primary">Room</span>
          </span>
        </Link>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/50 backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center pt-12 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground mx-auto">
                <ShieldCheck className="h-3 w-3" />
                Secure Access
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter uppercase">Welcome Back</CardTitle>
            <CardDescription className="font-medium">
              Enter your credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/80">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/80">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                    type="submit" 
                    className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 group" 
                    disabled={isPending}
                >
                  {isPending ? "Authenticating..." : "Sign In"}
                  <Zap className="ml-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center py-10 bg-muted/10 border-t border-muted">
            <p className="text-sm font-medium text-muted-foreground">
              New to Classroom?&nbsp;
              <Link
                to="/register"
                className="font-black text-primary hover:underline uppercase tracking-widest text-xs"
              >
                Create Account <ArrowRight className="inline h-3 w-3 ml-1" />
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
