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
  FileText,
} from "lucide-react";

/**
 * Returns a relevant Lucide icon component based on the subject name.
 * Optimized with regex testing for better performance.
 */
export const getSubjectIcon = (subjectName?: string | null) => {
  const name = (subjectName || "").toLowerCase();

  if (/(tech|code|computer|web|software|ai)/.test(name)) return Code;
  if (/(science|bio|chem|phys|lab)/.test(name)) return FlaskConical;
  if (/(math|calc|algebra)/.test(name)) return Calculator;
  if (/(lang|english|arabic|french|spanish|linguistics)/.test(name)) return Languages;
  if (/(art|design|draw|paint)/.test(name)) return Palette;
  if (/(music|band|choir)/.test(name)) return Music;
  if (/(sport|gym|physical|health|athletic)/.test(name)) return Dumbbell;
  if (/(hist|geog|social|civics|politi)/.test(name)) return Landmark;
  if (/(writ|lit|journalism)/.test(name)) return FileText;

  return BookOpen;
};
