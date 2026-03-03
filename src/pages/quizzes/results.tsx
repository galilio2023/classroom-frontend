import { useCustom, useNavigation } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { QuizAttempt, Quiz } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, User, Calendar, Trophy, Search } from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const QuizResults = () => {
  const { id } = useParams();
  const { list } = useNavigation();
  const [search, setSearch] = useState("");

  // Fetch Quiz Details
  const { query: quizQuery } = useCustom<Quiz>({
    url: `/quizzes/${id}`,
    method: "get",
  });

  // Fetch Quiz Results (Attempts)
  const { query: resultsQuery } = useCustom<QuizAttempt[]>({
    url: `/quizzes/${id}/results`,
    method: "get",
  });

  const quiz = quizQuery.data?.data;
  const attempts = resultsQuery.data?.data || [];
  const isLoading = quizQuery.isLoading || resultsQuery.isLoading;

  const filteredAttempts = attempts.filter((attempt: QuizAttempt) =>
    attempt.student?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) return null;

  const totalPoints = quiz.questions?.reduce((acc: number, q: any) => acc + (q.points || 1), 0) || 0;

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => list("classes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground">Student Performance Results</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Total Points: {totalPoints}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Submissions</span>
              <span className="font-bold">{attempts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Score</span>
              <span className="font-bold">
                {attempts.length > 0
                  ? Math.round(attempts.reduce((acc: number, curr: QuizAttempt) => acc + curr.score, 0) / attempts.length)
                  : 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {filteredAttempts.length > 0 ? (
              filteredAttempts.map((attempt: QuizAttempt) => (
                <Card key={attempt.id} className="overflow-hidden transition-all hover:border-primary/50">
                  <div className="flex items-center p-4 gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={attempt.student?.image} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{attempt.student?.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {Math.round((attempt.score / totalPoints) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">
                        {attempt.score}
                        <span className="text-xs text-muted-foreground font-normal ml-1">/ {totalPoints}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No results found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
