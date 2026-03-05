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
import { User as UserIcon, Mail, Shield, Lightbulb, Info, Phone, MapPin, FileText, Building2, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { userFormSchema } from "@/schemas/user";
import { UserRole, User, UserStatus, Department } from "@/types";

const UsersEdit = () => {
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

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <EditViewHeader />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Main Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)}>
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Edit User Profile
                  </CardTitle>
                  <CardDescription>
                    Update the profile and contact information for "{query?.data?.data.name}".
                  </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. john@school.com"
                              {...field}
                              disabled={!isAdmin} // Only admins can change emails
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role Dropdown */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            Role
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!isAdmin} // ONLY Admins can change roles
                          >
                            <FormControl>
                              <SelectTrigger className={!isAdmin ? "bg-muted cursor-not-allowed" : ""}>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={UserRole.STUDENT}>
                                Student
                              </SelectItem>
                              <SelectItem value={UserRole.TEACHER}>
                                Teacher
                              </SelectItem>
                              <SelectItem value={UserRole.ADMIN}>
                                Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {!isAdmin && (
                            <p className="text-[0.7rem] text-muted-foreground mt-1">
                              Only administrators can modify user roles.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status Dropdown */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            Account Status
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!isAdmin}
                          >
                            <FormControl>
                              <SelectTrigger className={!isAdmin ? "bg-muted cursor-not-allowed" : ""}>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                              <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                              <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department Dropdown */}
                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            Department
                          </FormLabel>
                          <Select 
                            onValueChange={(val) => field.onChange(val ? Number(val) : null)} 
                            value={field.value?.toString()}
                            disabled={!isAdmin}
                          >
                            <FormControl>
                              <SelectTrigger className={!isAdmin ? "bg-muted cursor-not-allowed" : ""}>
                                <SelectValue placeholder="Select a department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departmentOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234 567 890" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Physical Address
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="123 Education St, City, Country" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bio */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Biography
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a bit about this user..." 
                            className="min-h-[100px] resize-none"
                            {...field} 
                            value={field.value || ""}
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
                    {formLoading ? "Saving..." : "Save Changes"}
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
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong>Contact Data:</strong> Providing a phone number and address helps administrators reach out in case of emergencies.
              </p>
              <p>
                <strong>Biography:</strong> This is a great place to list academic interests or teaching specialties.
              </p>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Privacy Note</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              Contact information is only visible to administrators and the user themselves.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default UsersEdit;
