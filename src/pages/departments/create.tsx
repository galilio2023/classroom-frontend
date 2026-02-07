import { CreateViewHeader } from "@/components/refine-ui/views/create-view";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Code2, FileText, Lightbulb, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { departmentFormSchema } from "@/schemas/department";

const DepartmentsCreate = () => {
  const { 
    refineCore: { onFinish, formLoading }, 
    ...form 
  } = useForm({
    resolver: zodResolver(departmentFormSchema),
    refineCoreProps: {
      resource: "departments",
      redirect: "list",
    },
  });

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <CreateViewHeader />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Main Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)}>
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Department Details
                  </CardTitle>
                  <CardDescription>
                    Enter the core information for the new department.
                  </CardDescription>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Code Field */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-muted-foreground" />
                            Department Code
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CS" {...field} className="font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            Department Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of the department..." 
                            className="resize-none min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <Separator />
                
                <CardFooter className="flex justify-end pt-6 pb-6 bg-muted/5">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={formLoading}
                    className="min-w-[150px]"
                  >
                    {formLoading ? "Saving..." : "Create Department"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        {/* Right Column: Sidebar / Help */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p>
                  <strong>Short Codes:</strong> Use short, uppercase codes like "CS", "MATH", or "ENG" for easy reference.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p>
                  <strong>Clear Names:</strong> Use the full official name of the department.
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Did you know?</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              Departments are the top-level organization. You will assign subjects and teachers to them later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsCreate;
