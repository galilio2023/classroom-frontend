import { EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetIdentity, useSelect } from "@refinedev/core";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Lightbulb, 
  Info, 
  Phone, 
  MapPin, 
  FileText, 
  Building2, 
  Activity, 
  Pencil, 
  Sparkles, 
  Loader2, 
  Save, 
  ArrowRight,
  UserCheck
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { userFormSchema } from "@/schemas/user";
import { UserRole, User, UserStatus, Department } from "@/types";
import usePageTitle from "@/hooks/use-page-title";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UsersEdit = () => {
  usePageTitle("Edit User");
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === "admin";

  const {
    refineCore: { onFinish, formLoading, query },
    ...form
  } = useForm({
    resolver: zodResolver(userFormSchema),
    refineCoreProps: {
      resource: "users",
      action: "edit",
      redirect: "list",
    },
  });

  const { options: departmentOptions } = useSelect<Department>({
    resource: "departments",
    optionLabel: "name",
    optionValue: "id",
  });

  const user = query?.data?.data;

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
            <Pencil className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Edit Profile</h1>
            <p className="text-muted-foreground font-medium">Update account details and contact information for {user?.name || "User"}.</p>
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
                <CardHeader className="p-8 pb-4 flex flex-row items-center gap-6">
                  <Avatar className="h-20 w-20 rounded-2xl border-4 border-background shadow-lg">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary font-black text-2xl">
                      {user?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight">{user?.name}</CardTitle>
                    <CardDescription className="font-medium">
                      System ID: <span className="font-bold text-primary">{user?.id}</span>
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                      <UserIcon className="h-4 w-4 text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Core Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Name Field */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. John Doe" 
                                {...field} 
                                className="h-12 rounded-2xl border-primary/10 bg-background/50 focus:bg-background transition-all font-bold"
                              />
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  placeholder="e.g. john@school.com"
                                  {...field}
                                  disabled={!isAdmin}
                                  className="pl-11 h-12 rounded-2xl border-primary/10 bg-background/50 focus:bg-background transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              System Role
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!isAdmin}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-primary/10 bg-background/50 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <SelectValue placeholder="Select a role" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl">
                                <SelectItem value={UserRole.STUDENT} className="rounded-xl font-bold">Student</SelectItem>
                                <SelectItem value={UserRole.TEACHER} className="rounded-xl font-bold">Teacher</SelectItem>
                                <SelectItem value={UserRole.ADMIN} className="rounded-xl font-bold">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            {!isAdmin && (
                              <p className="text-[10px] font-bold text-muted-foreground/60 mt-1 ml-1">
                                Only administrators can modify user roles.
                              </p>
                            )}
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Account Status
                            </FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={!isAdmin}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-primary/10 bg-background/50 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    <SelectValue placeholder="Select status" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl">
                                <SelectItem value={UserStatus.ACTIVE} className="rounded-xl font-bold">Active</SelectItem>
                                <SelectItem value={UserStatus.INACTIVE} className="rounded-xl font-bold">Inactive</SelectItem>
                                <SelectItem value={UserStatus.SUSPENDED} className="rounded-xl font-bold">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs font-bold" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                      <Phone className="h-4 w-4 text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact & Bio</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Department Dropdown */}
                      <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Department Assignment
                            </FormLabel>
                            <Select 
                              onValueChange={(val) => field.onChange(val ? Number(val) : null)} 
                              value={field.value?.toString()}
                              disabled={!isAdmin}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-primary/10 bg-background/50 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <SelectValue placeholder="Select a department" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl">
                                {departmentOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value.toString()} className="rounded-xl font-bold">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs font-bold" />
                          </FormItem>
                        )}
                      />

                      {/* Phone Number */}
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input 
                                  placeholder="+1 234 567 890" 
                                  {...field} 
                                  value={field.value || ""} 
                                  className="pl-11 h-12 rounded-2xl border-primary/10 bg-background/50 focus:bg-background transition-all font-bold"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs font-bold" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Physical Address
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input 
                                placeholder="123 Education St, City, Country" 
                                {...field} 
                                value={field.value || ""} 
                                className="pl-11 h-12 rounded-2xl border-primary/10 bg-background/50 focus:bg-background transition-all font-bold"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Bio */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Biography
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a bit about this user..." 
                              className="min-h-[120px] rounded-2xl border-primary/10 bg-background/50 focus:bg-background transition-all font-medium resize-none p-4"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>

                <CardFooter className="p-8 bg-primary/[0.02] border-t border-primary/5 flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={formLoading}
                    className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 group"
                  >
                    {formLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    )}
                    {formLoading ? "Saving Changes..." : "Save Profile Changes"}
                    {!formLoading && <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
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
          <Card className="border-primary/10 shadow-lg rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight">Profile Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-xs uppercase tracking-widest text-primary">Contact Data</p>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Providing a phone number and address helps administrators reach out in case of emergencies.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-xs uppercase tracking-widest text-amber-600">Biography</p>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    This is a great place to list academic interests, teaching specialties, or personal achievements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="rounded-[2rem] border-primary/10 bg-primary/5 p-6">
            <Info className="h-5 w-5 text-primary" />
            <div className="ml-2">
              <AlertTitle className="font-black text-sm uppercase tracking-widest mb-2">Privacy Note</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground font-medium leading-relaxed">
                Contact information and physical addresses are only visible to administrators and the user themselves.
              </AlertDescription>
            </div>
          </Alert>

          {user?.status === UserStatus.ACTIVE && (
            <Card className="border-green-500/10 bg-green-500/5 rounded-[2rem] p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Account Status</p>
                <p className="text-lg font-black text-green-700">Verified & Active</p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UsersEdit;
