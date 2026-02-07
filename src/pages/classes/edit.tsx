import { EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelect } from "@refinedev/core";
import { useFieldArray } from "react-hook-form";
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
import { BookOpen, Users, Calendar, Plus, Trash2, Clock, Info } from "lucide-react";
import { classFormSchema } from "@/schemas/class";
import { ClassStatus, Subject, User, UserRole } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ClassesEdit = () => {
  const { 
    refineCore: { onFinish, formLoading, queryResult }, 
    ...form 
  } = useForm({
    resolver: zodResolver(classFormSchema),
    refineCoreProps: {
      resource: "classes",
      action: "edit",
      redirect: "list",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const { options: subjectOptions } = useSelect<Subject>({
    resource: "subjects",
    optionLabel: "name",
    optionValue: "id",
  });

  const { options: teacherOptions } = useSelect<User>({
    resource: "users",
    optionLabel: "name",
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: UserRole.TEACHER,
      },
    ],
  });

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <EditViewHeader />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)}>
              {/* Basic Details Card */}
              <Card className="border-border/50 shadow-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Edit Class
                  </CardTitle>
                  <CardDescription>
                    Update the details for "{queryResult?.data?.data.name}".
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Math 101 - Section A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} value={String(field.value)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjectOptions.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="teacherId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teacher</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {teacherOptions.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ClassStatus.ACTIVE}>Active</SelectItem>
                              <SelectItem value={ClassStatus.INACTIVE}>Inactive</SelectItem>
                              <SelectItem value={ClassStatus.ARCHIVED}>Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Class description..." className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Schedule Builder Card */}
              <Card className="border-border/50 shadow-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Schedule
                  </CardTitle>
                  <CardDescription>
                    Set the weekly schedule for this class.
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg bg-muted/5">
                        <FormField
                          control={form.control}
                          name={`schedules.${index}.day`}
                          render={({ field }) => (
                            <FormItem className="w-[120px]">
                              <FormLabel className="text-xs">Day</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`schedules.${index}.startTime`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs">Start Time</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input type="time" className="pl-8" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`schedules.${index}.endTime`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs">End Time</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input type="time" className="pl-8" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed"
                      onClick={() => append({ day: "Mon", startTime: "09:00", endTime: "10:30" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={formLoading} className="min-w-[150px]">
                  {formLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Info className="h-5 w-5 text-yellow-500" />
                Editing Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Changes to the schedule will update immediately for all enrolled students.
              </p>
            </CardContent>
          </Card>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Invite Code</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1 font-mono">
              {queryResult?.data?.data.inviteCode}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ClassesEdit;
