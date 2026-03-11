import { useRegister } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  School, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Loader2,
  BookOpen,
  Zap,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { RoleSelector } from "@/components/auth/role-selector";
import { VerificationUpload } from "@/components/auth/verification-upload";
import { motion, AnimatePresence } from "framer-motion";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "teacher", "parent"]),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  verificationDocumentUrl: z.string().optional(),
  verificationDocumentCldPubId: z.string().optional(),
});

const RegisterPage = () => {
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

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

  const generateAIBio = async () => {
    const name = form.getValues("name");
    if (!name) {
      toast.error("Please enter your name first");
      return;
    }

    setIsGeneratingBio(true);
    try {
      const response = await axios.post("/api/ai/generate-content", {
        prompt: `Generate a professional bio for a ${role} named ${name}. Keywords: passionate, experienced, dedicated. Keep it under 50 words.`,
        context: "User Registration Bio"
      });
      
      form.setValue("bio", response.data.content);
      toast.success("AI Bio generated!");
    } catch (error) {
      const fallbacks: Record<string, string> = {
        teacher: `Hello, I'm ${name}. I am a dedicated educator committed to fostering a positive and engaging learning environment for all my students.`,
        student: `Hi, I'm ${name}. I'm an enthusiastic student eager to learn and grow in my academic journey.`,
        parent: `Hello, I'm ${name}. I am a supportive parent dedicated to my child's educational success and well-being.`,
      };
      form.setValue("bio", fallbacks[role as keyof typeof fallbacks] || `Hi, I'm ${name}.`);
      toast.info("Generated a standard bio for you (AI service unavailable).");
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
      register(values, {
        onSuccess: () => {
          const successMsg = values.role === "teacher" 
            ? "Registration successful! Please wait for admin verification."
            : "Registration successful! Welcome to the classroom.";
          toast.success(successMsg);
          navigate("/login");
        },
        onError: (error: any) => {
          const errorMessage =
            error?.data?.message || error.message || "An unknown error occurred.";
          toast.error(errorMessage);
        },
      });
    })();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Class<span className="text-primary">Room</span>
          </span>
        </Link>

        <Card className="border-none shadow-2xl rounded-[3rem] bg-card/50 backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary mx-auto">
                <Sparkles className="h-3 w-3" />
                Step {step} of 2: {step === 1 ? "Account Setup" : "Profile Details"}
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter uppercase">Join Our Classroom</CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80">
              Complete your registration to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10">
            <Form {...form}>
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <RoleSelector 
                        value={role as "student" | "teacher" | "parent"}
                        onChange={(val) => form.setValue("role", val as any)} 
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/80">Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/80">Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/80">Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest leading-relaxed">
                          ⚡ Complete your profile for better experience.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/80">Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 000-0000" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {role === "student" && (
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/80">Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {role === "teacher" && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between items-center mb-1">
                                  <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/80">Professional Bio</FormLabel>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-2"
                                    onClick={generateAIBio}
                                    disabled={isGeneratingBio}
                                  >
                                    {isGeneratingBio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    AI Assist
                                  </Button>
                                </div>
                                <FormControl>
                                  <Textarea placeholder="Tell us about your teaching experience..." className="rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold resize-none" rows={3} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <VerificationUpload 
                            url={form.watch("verificationDocumentUrl") || ""}
                            onUpload={(url, publicId) => {
                              form.setValue("verificationDocumentUrl", url);
                              form.setValue("verificationDocumentCldPubId", publicId);
                              form.trigger("verificationDocumentUrl");
                            }}
                            onClear={() => {
                              form.setValue("verificationDocumentUrl", "");
                              form.setValue("verificationDocumentCldPubId", "");
                            }}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 pt-4">
                  {step > 1 && (
                    <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-muted" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  {step < 2 ? (
                    <Button type="button" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 group" onClick={nextStep}>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button type="button" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 group" disabled={isPending} onClick={handleFinalSubmit}>
                      {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Complete Join"}
                      <Zap className="ml-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center py-8 bg-muted/10 border-t border-muted">
            <p className="text-sm font-medium text-muted-foreground">
              Already have an account?&nbsp;
              <Link to="/login" className="font-black text-primary hover:underline uppercase tracking-widest text-xs">Sign In</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
