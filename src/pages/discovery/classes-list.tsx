import React, { useState } from "react";
import { useList, useNavigation } from "@refinedev/core";
import {
  LayoutGrid,
  Search,
  BookOpen,
  Users,
  ArrowRight,
  TrendingUp,
  Loader2,
  GraduationCap,
  CircleDollarSign,
  Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Class, User } from "@/types";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import Big from "big.js";

const PublicClassCard = ({ aClass }: { aClass: Class }) => {
  const { t } = useTranslation();
  const primaryTeacher = aClass.teachers?.find((t) => t.isPrimary)?.teacher;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className="border-none shadow-2xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-card transition-all duration-500 hover:shadow-primary/10">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={
              aClass.bannerUrl ||
              "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000"
            }
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            alt={aClass.name}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60" />

          <div className="absolute top-6 left-6 flex gap-2">
            <Badge className="bg-white/90 text-primary backdrop-blur-md border-none rounded-full px-4 py-1 font-black uppercase tracking-widest text-[10px] md:text-[11px]">
              {aClass.subject?.name}
            </Badge>
            {aClass.isPaid && (
              <Badge className="bg-primary text-white border-none rounded-full px-4 py-1 font-black uppercase tracking-widest text-[10px] md:text-[11px]">
                Premium
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="p-8 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                <AvatarImage src={primaryTeacher?.image || undefined} />
                <AvatarFallback className="text-[10px] font-black">
                  {primaryTeacher?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {primaryTeacher?.name}
              </span>
            </div>
            {aClass.isPaid && (
              <div className="flex items-center gap-1 text-primary">
                <CircleDollarSign className="h-4 w-4" />
                <span className="text-sm font-black">
                  {new Big(aClass.priceAmount || 0).toFixed(2)} {aClass.currency.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-black tracking-tight leading-[1.1] uppercase text-start line-clamp-2 min-h-[3rem]">
            {aClass.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-8 pt-0">
          <p className="text-sm text-muted-foreground font-medium text-start line-clamp-3 leading-relaxed">
            {aClass.description ||
              "Discover a world of knowledge in this immersive classroom experience."}
          </p>
        </CardContent>

        <CardFooter className="p-8 pt-4">
          <Button
            asChild
            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all duration-500"
          >
            <Link to={`/discovery/classes/${aClass.id}`}>
              Preview Curriculum
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const PublicClassesPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { query } = useList<Class>({
    resource: "public-classes",
    pagination: { pageSize: 12 },
    filters: search ? [{ field: "name", operator: "contains", value: search }] : [],
  });

  const { data, isLoading } = query;
  const classes = data?.data || [];

  return (
    <div className="container-center section-wrapper !pt-10">
      <div className="noise-overlay" />

      {/* Hero Header */}
      <header className="space-y-12 mb-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-start">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">
              <Globe className="h-3.5 w-3.5" />
              Global Marketplace
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-gradient">
              Open <span className="text-primary/30">Catalog</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl">
              Explore our world-class curriculum. Join thousands of students learning from top
              educators.
            </p>
          </div>

          <div className="relative group w-full md:w-[400px]">
            <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-ai-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute start-6 h-5 w-5 text-muted-foreground/40" />
              <Input
                placeholder="Search classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-16 ps-16 pe-8 rounded-full bg-card border-border/40 shadow-xl font-bold placeholder:text-muted-foreground/20 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Grid Section */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40 stroke-[1]" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              Synchronizing Catalog...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {classes.map((aClass) => (
                <PublicClassCard key={aClass.id} aClass={aClass} />
              ))}
            </div>

            {classes.length === 0 && (
              <div className="text-center py-40 space-y-6">
                <div className="p-8 rounded-full bg-muted/30 w-fit mx-auto">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/20" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">No Classes Found</h2>
                <p className="text-muted-foreground font-medium">
                  We're constantly adding new courses. Check back soon!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicClassesPage;
