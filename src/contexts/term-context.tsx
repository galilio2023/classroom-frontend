import React, { createContext, useContext, useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { AcademicTerm } from "@/types";

interface TermContextType {
  currentTerm: AcademicTerm | null;
  selectedTerm: AcademicTerm | null;
  setSelectedTerm: (term: AcademicTerm) => void;
  terms: AcademicTerm[];
  isLoading: boolean;
}

const TermContext = createContext<TermContextType | undefined>(undefined);

export const TermProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);

  // Refine useList implementation returns { data, query }
  const { data: result, query } = useList<AcademicTerm>({
    resource: "academic-terms",
    sorters: [
      {
        field: "startDate",
        order: "desc",
      },
    ],
    queryOptions: {
      staleTime: 5 * 60 * 1000,
    },
  });

  const terms = result?.data || [];
  const isLoading = query.isLoading;

  const currentTerm = terms.find((t: AcademicTerm) => t.status === "active") || terms[0] || null;

  useEffect(() => {
    if (currentTerm && !selectedTerm) {
      setSelectedTerm(currentTerm);
    }
  }, [currentTerm, selectedTerm]);

  return (
    <TermContext.Provider
      value={{
        currentTerm,
        selectedTerm,
        setSelectedTerm,
        terms,
        isLoading,
      }}
    >
      {children}
    </TermContext.Provider>
  );
};

export const useTerm = () => {
  const context = useContext(TermContext);
  if (context === undefined) {
    throw new Error("useTerm must be used within a TermProvider");
  }
  return context;
};
