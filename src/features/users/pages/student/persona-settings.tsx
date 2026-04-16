import React, { useEffect } from "react";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {} from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Sparkles, Loader2, Save, UserCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {} from "framer-motion";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";

const personaSchema = z.object({
  learningDNA: z.string().min(10, "Please describe your learning style in more detail."),
  preferredTone: z.enum(["encouraging", "strict", "analytical", "creative", "concise"]),
});

type PersonaFormValues = z.infer<typeof personaSchema>;

const StudentPersonaSettings = () => {
  const { t } = useTranslation();
  usePageTitle("AI Personalization");

  const { result: personaData, query } = useCustom<any>({
    url: "/users/me/persona",
    method: "get",
  });

  const { mutate: updatePersona, mutation } = useCustomMutation<any>();

  const form = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      learningDNA: "",
      preferredTone: "encouraging",
    },
  });

  useEffect(() => {
    if (personaData?.data) {
      form.reset({
        learningDNA: personaData.data.learningDNA,
        preferredTone: personaData.data.preferredTone,
      });
    }
  }, [personaData?.data, form]);

  const onSubmit = (values: PersonaFormValues) => {
    updatePersona(
      {
        url: "/users/me/persona",
        method: "patch",
        values,
      },
      {
        onSuccess: () => {
          toast.success("AI Persona updated. Your Study Buddy will adapt accordingly.");
        },
        onError: () => {
          toast.error("Failed to update AI persona.");
        },
      }
    );
  };

  if (query.isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
      <header className="space-y-4 text-start">
        <Breadcrumb />
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-ai-primary/10 text-ai-primary border border-ai-primary/5 shadow-sm">
            <BrainCircuit className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">AI Personalization</h1>
            <p className="text-muted-foreground font-medium">
              Configure how Gemini interacts with you across the platform.
            </p>
          </div>
        </div>
      </header>

      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ai-primary" />
            Learning Profile
          </CardTitle>
          <CardDescription className="font-medium">
            This data is used as "System Context" for your AI Study Buddy and Lesson Roadmap
            generators.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-start">
              <FormField
                control={form.control}
                name="learningDNA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Learning DNA
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I am a visual learner who struggles with complex math but excels at practical examples. I prefer learning through analogies..."
                        className="min-h-[150px] rounded-2xl bg-muted/20 border-none font-medium p-6"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Describe your learning style, strengths, and weaknesses. The AI will adapt its
                      explanations to match.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Interaction Tone
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none font-bold">
                          <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="encouraging">Encouraging & Supportive</SelectItem>
                        <SelectItem value="strict">Strict & Disciplined</SelectItem>
                        <SelectItem value="analytical">Deeply Analytical</SelectItem>
                        <SelectItem value="creative">Creative & Imaginative</SelectItem>
                        <SelectItem value="concise">Concise & Direct</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[10px]">
                      Choose how you want the AI to talk to you.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-ai-primary/20 bg-ai-primary hover:bg-ai-primary/90"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin me-3" />
                ) : (
                  <Save className="h-5 w-5 me-3" />
                )}
                Save Personalization
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-dashed border-2 border-primary/10 bg-primary/5 p-8 text-start">
        <div className="flex gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary h-fit">
            <UserCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm uppercase tracking-tight">Privacy Note</h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Your Learning DNA is encrypted and only used to improve AI interactions. It is never
              shared with other students or used for grading purposes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentPersonaSettings;
