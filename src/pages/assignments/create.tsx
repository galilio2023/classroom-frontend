import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { useGo, useList } from "@refinedev/core";
import { toast } from "sonner";
import { AIAssignmentHelper } from "@/components/ai-assignment-helper";
import { FileUpload } from "@/components/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Paperclip, Loader2, Wand2, X, BookOpen } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { Module, Class } from "@/types";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  fileUrl: z.string().optional(),
  fileCldPubId: z.string().optional(),
  moduleId: z.coerce.number().optional().nullable(),
  classId: z.coerce.number().min(1, "Class is required"),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export const AssignmentCreate = () => {
  const [searchParams] = useSearchParams();
  const urlClassId = searchParams.get("classId");
  const initialModuleId = searchParams.get("moduleId");
  const go = useGo();
  const [showAI, setShowAI] = useState(false);

  // Fetch all classes for the teacher (in case they came from the global AI assistant)
  const { query: classesQuery } = useList<Class>({
    resource: "classes",
    pagination: { mode: "off" },
  });

  const classes = classesQuery.data?.data || [];
  const classesLoading = classesQuery.isLoading;

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      fileUrl: "",
      fileCldPubId: "",
      moduleId: initialModuleId ? Number(initialModuleId) : null,
      classId: urlClassId ? Number(urlClassId) : undefined as any,
    },
    refineCoreProps: {
      resource: "assignments",
      action: "create",
      onMutationSuccess: () => {
        const targetClassId = form.getValues("classId");
        go({ to: `/classes/show/${targetClassId}`, type: "replace" });
      },
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    refineCore: { onFinish, formLoading },
  } = form;

  const selectedClassId = watch("classId");

  // Fetch modules for the SELECTED class
  const { query: modulesQuery } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: selectedClassId }],
    queryOptions: { enabled: !!selectedClassId },
  });

  const modules = modulesQuery.data?.data || [];
  const modulesLoading = modulesQuery.isLoading;

  useEffect(() => {
    if (initialModuleId) {
      setValue("moduleId", Number(initialModuleId));
    }
    
    const pendingContent = sessionStorage.getItem("pending_ai_assignment");
    if (pendingContent) {
        setValue("description", pendingContent);
        sessionStorage.removeItem("pending_ai_assignment");
        toast.info("AI draft applied from Assistant.");
        setShowAI(false);
    }
  }, [initialModuleId, setValue]);

  const onSubmit = (values: FieldValues) => {
    onFinish(values);
  };

  const handleUseAIContent = (content: string) => {
    setValue("description", content);
    toast.success("AI content applied!");
    document.getElementById("description")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = (url: string, publicId: string) => {
    setValue("fileUrl", url);
    setValue("fileCldPubId", publicId);
  };

  return (
    <CreateView className="max-w-full">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black tracking-tight">New Assignment</h1>
                <p className="text-muted-foreground text-sm">Fill in the details below to publish your task.</p>
            </div>
            {!showAI && (
                <Button 
                    variant="outline" 
                    onClick={() => setShowAI(true)}
                    className="gap-2 rounded-xl h-11 px-6 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 transition-all animate-in fade-in zoom-in-95"
                >
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </Button>
            )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Main Form */}
            <div className={cn(
                "transition-all duration-500 ease-in-out",
                showAI ? "xl:col-span-7" : "xl:col-span-8 xl:col-start-3"
            )}>
                <Card className="shadow-xl border-primary/10 overflow-hidden">
                    <div className="h-1.5 bg-primary/10 w-full" />
                    <CardHeader>
                        <CardTitle>Assignment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={control}
                                        name="classId"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                <BookOpen className="h-3 w-3" />
                                                Target Class
                                            </FormLabel>
                                            <Select 
                                                onValueChange={(val) => {
                                                    field.onChange(Number(val));
                                                    setValue("moduleId", null); // Reset module when class changes
                                                }} 
                                                value={field.value?.toString()}
                                                disabled={!!urlClassId} // Lock if we came from a specific class
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                                                        <SelectValue placeholder={classesLoading ? "Loading classes..." : "Select a class"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classes.map((c: Class) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="title"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Assignment Title</FormLabel>
                                            <FormControl>
                                            <Input placeholder="e.g., Physics Lab Report" {...field} className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={control}
                                        name="moduleId"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Curriculum Module</FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                value={field.value?.toString() || "0"}
                                                disabled={!selectedClassId}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                                                        <SelectValue placeholder={!selectedClassId ? "Select a class first" : modulesLoading ? "Loading..." : "Select module"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">None (Global)</SelectItem>
                                                    {modules.map((m: Module) => (
                                                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="dueDate"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Submission Deadline</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="h-12 rounded-xl bg-muted/20 border-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Instructions & Content</FormLabel>
                                        <FormControl>
                                        <Textarea
                                            id="description"
                                            placeholder="Type your instructions here or use the AI Assistant..."
                                            className="min-h-[400px] rounded-2xl resize-none p-6 leading-relaxed bg-muted/10 border-dashed border-2 border-border/50 focus-visible:border-primary/50 transition-colors"
                                            {...field}
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border/50">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 block">Reference Materials (Optional)</Label>
                                    <FileUpload 
                                        label="Upload PDF or Document"
                                        folder="assignments"
                                        onUploadSuccess={handleFileUpload}
                                    />
                                    {watch("fileUrl") && (
                                        <div className="mt-4 flex items-center gap-2 text-xs text-success font-bold bg-success/5 dark:bg-success/10 p-3 rounded-xl w-fit border border-success/20">
                                            <Paperclip className="h-3.5 w-3.5" />
                                            File attached successfully
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" disabled={formLoading} size="lg" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                                    {formLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Wand2 className="mr-2 h-6 w-6" />}
                                    {formLoading ? "Publishing..." : "Publish Assignment"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            {/* AI Assistant Side Panel */}
            {showAI && (
                <div className="xl:col-span-5 animate-in slide-in-from-right-12 duration-700 sticky top-24">
                    <Card className="border-ai-primary/20 shadow-2xl shadow-ai-primary/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl overflow-hidden">
                        <div className="h-1.5 bg-ai-primary w-full" />
                        <CardHeader className="bg-ai-primary/5 border-b border-ai-primary/10 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-ai-primary" />
                                <CardTitle className="text-ai-primary text-sm font-black uppercase tracking-widest">AI Writing Assistant</CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowAI(false)} className="h-8 w-8 rounded-full hover:bg-ai-primary/10">
                                <X className="h-4 w-4 text-ai-primary" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <AIAssignmentHelper onUseContent={handleUseAIContent} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </div>
    </CreateView>
  );
};
