import React from "react";
import { GraduationCap, PlusCircle, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@refinedev/core";
import { motion } from "framer-motion";

export const StudentOnboarding = () => {
  const { list } = useNavigation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative group">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-ai-primary to-primary opacity-20 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-ai-primary/10 rounded-full blur-[80px] animate-pulse delay-700" />

        <CardHeader className="text-center pt-12 pb-8 relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto p-6 bg-primary/10 rounded-3xl w-fit mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/5"
          >
            <GraduationCap className="h-12 w-12 text-primary drop-shadow-lg" />
          </motion.div>
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                Get Started
              </span>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Welcome to your Digital Classroom!
            </CardTitle>
            <CardDescription className="text-lg font-medium text-muted-foreground/80 leading-relaxed">
              You haven't joined any classes yet. Join a class to start your learning journey, access assignments, and collaborate with peers.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center pb-12 relative z-10 px-6 md:px-12">
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl w-full">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-background/50 backdrop-blur-md p-8 rounded-[2rem] border border-black/[0.05] dark:border-white/[0.05] shadow-xl flex flex-col items-center text-center group/card hover:border-primary/20 transition-all duration-300"
            >
              <div className="p-4 bg-blue-500/10 rounded-2xl mb-6 group-hover/card:scale-110 transition-transform duration-500">
                <PlusCircle className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-3">Join a Class</h3>
              <p className="text-sm font-medium text-muted-foreground/80 mb-8 leading-relaxed">
                Enter a class code provided by your teacher to join a new classroom and start learning.
              </p>
              <Button 
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                onClick={() => list("classes")}
              >
                Join Class
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-background/50 backdrop-blur-md p-8 rounded-[2rem] border border-black/[0.05] dark:border-white/[0.05] shadow-xl flex flex-col items-center text-center group/card hover:border-purple-500/20 transition-all duration-300"
            >
              <div className="p-4 bg-purple-500/10 rounded-2xl mb-6 group-hover/card:scale-110 transition-transform duration-500">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-3">Explore Resources</h3>
              <p className="text-sm font-medium text-muted-foreground/80 mb-8 leading-relaxed">
                Check out public resources, study materials, and AI-powered tools available to all students.
              </p>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-2 hover:bg-purple-500/5 hover:text-purple-600 hover:border-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                onClick={() => list("resources")}
              >
                View Resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
