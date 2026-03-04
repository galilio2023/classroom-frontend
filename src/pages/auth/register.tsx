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
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { RoleSelector } from "@/components/auth/role-selector";
import { VerificationUpload } from "@/components/auth/verification-upload";

// Enhanced Schema with Conditional Validation
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "teacher"]),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  verificationDocumentUrl: z.string().optional(),
  verificationDocumentCldPubId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "teacher" && !data.verificationDocumentUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Verification document is required for teachers",
      path: ["verificationDocumentUrl"],
    });
  }
  if (data.role === "student") {
      // Optional: Enforce parent info for students if needed, 
      // but keeping it optional for now as per original logic.
  }
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
      // Corrected API Endpoint
      const response = await axios.post("/api/ai/generate-content", {
        prompt: `Generate a professional bio for a ${role} named ${name}. Keywords: passionate, experienced, dedicated. Keep it under 50 words.`,
        context: "User Registration Bio"
      });
      
      // The backend returns { content: "..." }
      form.setValue("bio", response.data.content);
      toast.success("AI Bio generated!");
    } catch (error) {
      const fallbackBio = role === "teacher" 
        ? `Hello, I'm ${name}. I am a dedicated educator committed to fostering a positive and engaging learning environment for all my students.`
        : `Hi, I'm ${name}. I'm an enthusiastic student eager to learn and grow in my academic journey.`;
      form.setValue("bio", fallbackBio);
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
          toast.success("Registration successful! Please wait for admin verification.");
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step === 1) nextStep();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <School className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Join Our Classroom</CardTitle>
          <CardDescription>
            Step {step} of 2: {step === 1 ? "Account Details" : "Complete Your Profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div onKeyDown={handleKeyDown} className="space-y-6">
              {/* STEP 1 */}
              <div className={cn("space-y-4 animate-in fade-in duration-300", step !== 1 && "hidden")}>
                <RoleSelector 
                  value={role} 
                  onChange={(val) => form.setValue("role", val)} 
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="h-11" />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} className="h-11" />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                      </FormControl>
                      <FormDescription>Must be at least 8 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* STEP 2 */}
              <div className={cn("space-y-4 animate-in fade-in duration-300", step !== 2 && "hidden")}>
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {role === "student" ? (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent/Guardian Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parentPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 000-0000" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Professional Bio</FormLabel>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={generateAIBio}
                              disabled={isGeneratingBio}
                            >
                              {isGeneratingBio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                              AI Generate
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea placeholder="Tell us about your teaching experience..." className="resize-none" rows={3} {...field} />
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
                        // Trigger validation to clear error if any
                        form.trigger("verificationDocumentUrl");
                      }}
                      onClear={() => {
                        form.setValue("verificationDocumentUrl", "");
                        form.setValue("verificationDocumentCldPubId", "");
                      }}
                    />
                    {/* Explicit error message for verification document */}
                    {form.formState.errors.verificationDocumentUrl && (
                        <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.verificationDocumentUrl.message}
                        </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                {step < 2 ? (
                  <Button type="button" className="flex-1 h-11" onClick={nextStep}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="button" className="flex-1 h-11" disabled={isPending} onClick={handleFinalSubmit}>
                    {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Complete Registration"}
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm border-t bg-slate-50/50 dark:bg-slate-950/50 py-4 rounded-b-xl">
          <p className="text-muted-foreground">
            Already have an account?&nbsp;
            <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
