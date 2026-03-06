import React from "react";
import { GraduationCap, PlusCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@refinedev/core";

export const StudentOnboarding = () => {
  const { list } = useNavigation();

  return (
    <Card className="border-primary/20 bg-primary/5 mb-8 overflow-hidden relative">
      <CardHeader className="text-center">
        <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
          <GraduationCap className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome to your Digital Classroom!</CardTitle>
        <CardDescription className="max-w-md mx-auto">
          You haven't joined any classes yet. Join a class to start your learning journey, access assignments, and collaborate with peers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-8">
        <div className="grid gap-6 md:grid-cols-2 max-w-2xl w-full">
          <div className="bg-background p-6 rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg mb-4">
              <PlusCircle className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-bold mb-2">Join a Class</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Enter a class code provided by your teacher to join a new classroom.
            </p>
            <Button className="w-full group" onClick={() => list("classes")}>
              Join Class
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="bg-background p-6 rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg mb-4">
              <GraduationCap className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-bold mb-2">Explore Resources</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Check out public resources and study materials available to all students.
            </p>
            <Button variant="outline" className="w-full group" onClick={() => list("resources")}>
              View Resources
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
