import {} from "@/components/refine-ui/views/create-view";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelect } from "@refinedev/core";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {} from "@/components/ui/separator";
import {
  User,
  Mail,
  Shield,
  Lightbulb,
  Info,
  Building2,
  Activity,
  UserPlus,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { userFormSchema } from "@/schemas/user";
import { UserRole, UserStatus, Department } from "@/types";
import usePageTitle from "@/hooks/use-page-title";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

const UsersCreate = () => {
  usePageTitle("Create User");
  const {
    refineCore: { onFinish, formLoading },
    ...form
  } = useForm({
    resolver: zodResolver(userFormSchema),
    refineCoreProps: {
      resource: "users",
      redirect: "list",
    },
    defaultValues: {
      status: UserStatus.ACTIVE,
    },
  });

  const { options: departmentOptions } = useSelect<Department>({
    resource: "departments",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <div className="container mx-auto py-10 max-w-6xl space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Breadcrumb />
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
            <UserPlus className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Onboard New User</h1>
            <p className="text-muted-foreground font-medium">
              Create a new account for a student, teacher, or administrator.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: The Main Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)}>
              <Card className="border-primary/10 shadow-xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <CardTitle className="text-2xl font-black tracking-tight">
                      User Profile
                    </CardTitle>
                  </div>
                  <CardDescription className="font-medium">
                    Enter the essential profile information to set up the new account.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <User className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                placeholder="e.g. John Doe"
                                {...field}
                                className="ps-11 h-12 rounded-2xl border-primary/10 bg-background/50 focus:bg-background transition-all"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Mail className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                placeholder="e.g. john@school.com"
                                {...field}
                                className="ps-11 h-12 rounded-2xl border-primary/10 bg-background/50 focus:bg-background transition-all"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Role Dropdown */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                            System Role
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-2xl border-primary/10 bg-background/50 font-bold text-sm">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-primary" />
                                  <SelectValue placeholder="Select a role" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                              <SelectItem value={UserRole.STUDENT} className="rounded-xl font-bold">
                                Student
                              </SelectItem>
                              <SelectItem value={UserRole.TEACHER} className="rounded-xl font-bold">
                                Teacher
                              </SelectItem>
                              <SelectItem value={UserRole.ADMIN} className="rounded-xl font-bold">
                                Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Status Dropdown */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                            Initial Status
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-2xl border-primary/10 bg-background/50 font-bold text-sm">
                                <div className="flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-primary" />
                                  <SelectValue placeholder="Select status" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                              <SelectItem
                                value={UserStatus.ACTIVE}
                                className="rounded-xl font-bold"
                              >
                                Active
                              </SelectItem>{" "}
                              <SelectItem
                                value={UserStatus.INACTIVE}
                                className="rounded-xl font-bold"
                              >
                                Inactive
                              </SelectItem>
                              <SelectItem
                                value={UserStatus.SUSPENDED}
                                className="rounded-xl font-bold"
                              >
                                Suspended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Department Dropdown */}
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                          Department Assignment
                        </FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border-primary/10 bg-background/50 font-bold text-sm">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <SelectValue placeholder="Select a department (optional)" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                            {departmentOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value.toString()}
                                className="rounded-xl font-bold"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs font-bold" />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardFooter className="p-8 bg-primary/2 border-t border-primary/5 flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={formLoading}
                    className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 group"
                  >
                    {formLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 me-2 group-hover:scale-110 transition-transform" />
                    )}
                    {formLoading ? "Creating Account..." : "Create User Account"}
                    {!formLoading && (
                      <ArrowRight className="h-4 w-4 ms-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </motion.div>

        {/* Right Column: Sidebar / Help */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <Card className="border-primary/10 shadow-lg rounded-4xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight">
                  Role Permissions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-destructive" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-xs uppercase tracking-widest text-destructive">
                    Administrators
                  </p>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Full system access, user management, and institutional settings.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-xs uppercase tracking-widest text-primary">
                    Teachers
                  </p>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Manage classes, curriculum, assignments, and student grading.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-2xl bg-secondary/50 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">
                    Students
                  </p>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Access enrolled classes, submit assignments, and track progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="rounded-4xl border-primary/10 bg-primary/5 p-6">
            <Info className="h-5 w-5 text-primary" />
            <div className="ms-2">
              <AlertTitle className="font-black text-sm uppercase tracking-widest mb-2">
                Next Steps
              </AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground font-medium leading-relaxed">
                Once created, the user will receive an automated invitation email to set their
                secure password and complete their profile.
              </AlertDescription>
            </div>
          </Alert>
        </motion.div>
      </div>
    </div>
  );
};

export default UsersCreate;
