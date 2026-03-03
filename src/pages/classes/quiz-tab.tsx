import { useCustom, useNavigation, useGetIdentity } from "@refinedev/core";
import { Quiz, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileQuestion, PlusCircle, ArrowRight, Trophy, Clock } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";

interface QuizTabProps {
  classId: string;
}

export const QuizTab = ({ classId }: QuizTabProps) => {
  const { show, create } = useNavigation();
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === "teacher" || identity?.role === "admin";

  const { query: quizQuery } = useCustom<Quiz[]>({
    url: `/quizzes`,
    method: "get",
    config: {
      query: { classId },
    }
  });

  const quizzes = quizQuery.data?.data || [];
  const isLoading = quizQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Class Quizzes</h3>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} quizzes available for this class.
          </p>
        </div>
        {isStaff && (
          <Button onClick={() => create("quizzes", "push", { query: { classId } })}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        )}
      </div>

      {quizzes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz: Quiz) => (
            <Card key={quiz.id} className="overflow-hidden transition-all hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FileQuestion className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {quiz.timeLimit && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {quiz.timeLimit}m
                      </Badge>
                    )}
                    {quiz.dueDate && (
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">
                        Due: {new Date(quiz.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-4">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {quiz.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">
                    {quiz.questions?.length || 0} Questions
                  </div>
                  <div className="flex gap-2">
                    {isStaff ? (
                      <Button variant="outline" size="sm" onClick={() => show("quizzes", quiz.id.toString(), "push", { query: { action: "results" } })}>
                        <Trophy className="h-4 w-4 mr-2" />
                        Results
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => show("quizzes", quiz.id.toString())}>
                        Take Quiz
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>No quizzes yet</CardTitle>
            <CardDescription className="max-w-xs mx-auto mt-2">
              {isStaff 
                ? "Create your first quiz to test your students' knowledge." 
                : "Your teacher hasn't posted any quizzes for this class yet."}
            </CardDescription>
            {isStaff && (
              <Button className="mt-6" onClick={() => create("quizzes", "push", { query: { classId } })}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
