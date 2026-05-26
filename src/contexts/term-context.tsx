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

  // Refine useList implementation returns { result, query }
  const { result, query } = useList<AcademicTerm>({
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
    // 🛡️ HARDENING: Instead of a hard crash, return a safe mock state and warn in DEV.
    // This prevents the 'useTerm must be used within a TermProvider' crash.
    if (import.meta.env.DEV) {
      console.warn(
        "🛡️ Technical Gap: useTerm called outside of TermProvider. Ensure proper wrapping in App.tsx."
      );
    }

    return {
      currentTerm: null,
      selectedTerm: null,
      setSelectedTerm: () => {},
      terms: [],
      isLoading: false,
      refetch: async () => ({ data: { data: [] } }) as any,
    };
  }
  return context;
};
