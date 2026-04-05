import React from "react";
import { useNavigation, useTranslate, useCreate } from "@refinedev/core";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, ArrowLeft, Plus, Award, Image as ImageIcon, Loader2, Target } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BadgeCreate() {
  const t = useTranslate();
  const { list } = useNavigation();
  const { mutate: create, mutation } = useCreate();
  const isLoading = mutation.isPending;

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      iconUrl: "",
      criteria: {
        type: "manual",
        value: 0,
      },
    },
  });

  const onSubmit = (values: any) => {
    create(
      {
        resource: "badges",
        values,
      },
      {
        onSuccess: () => {
          list("badges");
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => list("badges")} className="rounded-xl font-bold gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("buttons.back")}
      </Button>

      <Card className="shadow-2xl border-2 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
        <CardHeader className="bg-muted/30 pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-2xl shadow-inner">
              <Trophy className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-3xl font-black tracking-tight">
                Design Achievement Badge
              </CardTitle>
              <CardDescription className="font-medium text-base mt-1">
                Create a new reward to motivate student engagement and performance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Badge name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground flex items-center gap-2">
                          <Award className="h-3 w-3 text-primary" />
                          Badge Identity
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Master Researcher"
                            className="rounded-xl h-14 border-2 font-bold text-lg focus-visible:ring-primary shadow-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px] font-medium">
                          A short, catchy name for the achievement.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="iconUrl"
                    rules={{ required: "Icon URL is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground flex items-center gap-2">
                          <ImageIcon className="h-3 w-3 text-primary" />
                          Visual Asset URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://cloudinary.com/..."
                            className="rounded-xl h-12 border-2 font-medium shadow-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px] font-medium">
                          Use high-quality PNG or SVG illustrations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="criteria.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground flex items-center gap-2">
                          <Target className="h-3 w-3 text-primary" />
                          Earning Logic
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-14 border-2 font-bold shadow-sm">
                              <SelectValue placeholder="Select trigger" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="manual" className="font-bold">
                              Manual Assignment
                            </SelectItem>
                            <SelectItem value="xp_threshold" className="font-bold">
                              XP Threshold
                            </SelectItem>
                            <SelectItem value="streak_count" className="font-bold">
                              Streak Milestone
                            </SelectItem>
                            <SelectItem value="course_completion" className="font-bold">
                              Course Completion
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                          Mission Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain what the student achieved..."
                            className="rounded-xl min-h-[100px] border-2 font-medium shadow-sm resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 rounded-2xl font-black gap-3 text-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Plus className="h-6 w-6 stroke-[3]" />
                  )}
                  Forge Achievement
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
