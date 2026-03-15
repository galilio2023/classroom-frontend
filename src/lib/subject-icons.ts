import { 
  BookOpen, 
  Calculator,
  FlaskConical,
  Languages,
  Palette,
  Music,
  Dumbbell,
  Code,
  Landmark,
  FileText
} from "lucide-react";

export const getSubjectIcon = (subjectName?: string | null) => {
  const name = (subjectName || "").toLowerCase();
  
  // High Priority / Specific matches
  if (name.includes("tech") || name.includes("code") || name.includes("computer") || name.includes("web") || name.includes("software") || name.includes("ai")) return Code;
  if (name.includes("science") || name.includes("bio") || name.includes("chem") || name.includes("phys") || name.includes("lab")) return FlaskConical;
  if (name.includes("math") || name.includes("calc") || name.includes("algebra")) return Calculator;
  if (name.includes("lang") || name.includes("english") || name.includes("arabic") || name.includes("french") || name.includes("spanish") || name.includes("linguistics")) return Languages;
  if (name.includes("art") || name.includes("design") || name.includes("draw") || name.includes("paint")) return Palette;
  if (name.includes("music") || name.includes("band") || name.includes("choir")) return Music;
  if (name.includes("sport") || name.includes("gym") || name.includes("physical") || name.includes("health") || name.includes("athletic")) return Dumbbell;
  if (name.includes("hist") || name.includes("geog") || name.includes("social") || name.includes("civics") || name.includes("politi")) return Landmark;
  if (name.includes("writ") || name.includes("lit") || name.includes("journalism")) return FileText;
  
  return BookOpen;
};
