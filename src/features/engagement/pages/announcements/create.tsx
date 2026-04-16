import React from "react";
import { useNavigation, useTranslate, useCreate, useList } from "@refinedev/core";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, ArrowLeft, Send, Pin, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AnnouncementCreate() {
  const t = useTranslate();
  const { list } = useNavigation();
  const { mutate: create, mutation } = useCreate();
  const isLoading = mutation.isPending;

  // Fetch classes for the dropdown
  const { query: classesQuery } = useList({
    resource: "classes",
  });
  const classes = classesQuery.data?.data || [];
  const isClassesLoading = classesQuery.isLoading;

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      classId: "",
      isPinned: false,
    },
  });

  const onSubmit = (values: any) => {
    create(
      {
        resource: "announcements",
        values: {
          ...values,
          classId: Number(values.classId),
        },
      },
      {
        onSuccess: () => {
          list("announcements");
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => list("announcements")}
        className="rounded-xl font-bold gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("buttons.back")}
      </Button>

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-muted/30 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">
                {t("actions.create")} {t("resources.announcements.label")}
              </CardTitle>
              <CardDescription className="font-medium">
                Broadcast an update to your students.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="classId"
                rules={{ required: "Please select a class" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Target Class
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12 border-2 font-medium">
                          <SelectValue
                            placeholder={isClassesLoading ? "Loading classes..." : "Select a class"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {classes.map((cls: any) => (
                          <SelectItem
                            key={cls.id}
                            value={cls.id.toString()}
                            className="font-medium"
                          >
                            {cls.title}
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
                name="title"
                rules={{ required: "Title is required", minLength: 3 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Announcement Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Exam Date Rescheduled"
                        className="rounded-xl h-12 border-2 font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                rules={{ required: "Content is required", minLength: 5 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                      Content
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your message here..."
                        className="rounded-xl min-h-32 border-2 font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPinned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-bold flex items-center gap-2">
                        <Pin className="h-4 w-4 text-primary" />
                        Pin Announcement
                      </FormLabel>
                      <FormDescription className="font-medium">
                        Keep this announcement at the top of the list.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold gap-2 text-lg shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {t("buttons.create")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
