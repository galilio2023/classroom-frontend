import { useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useClassTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabMapping: { [key: string]: { primary: string; sub: string } } =
    useMemo(
      () => ({
        curriculum: { primary: "content", sub: "curriculum" },
        resources: { primary: "content", sub: "resources" },
        assignments: { primary: "assessments", sub: "assignments" },
        quizzes: { primary: "assessments", sub: "quizzes" },
        announcements: { primary: "engagement", sub: "announcements" },
        discussions: { primary: "engagement", sub: "discussions" },
        live: { primary: "engagement", sub: "live" },
        students: { primary: "roster", sub: "students" },
        attendance: { primary: "roster", sub: "attendance" },
        analytics: { primary: "progress", sub: "analytics" },
        leaderboard: { primary: "progress", sub: "leaderboard" },
        details: { primary: "info", sub: "details" },
      }),
      [],
    );

  const activePrimaryTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      Object.values(tabMapping).some((m) => m.primary === tabParam)
    ) {
      return tabParam;
    } else if (tabParam && tabMapping[tabParam]) {
      return tabMapping[tabParam].primary;
    }
    return "content";
  }, [searchParams, tabMapping]);

  const activeSubTab = useMemo(() => {
    const subTabParam = searchParams.get("subtab");
    const tabParam = searchParams.get("tab");

    if (subTabParam) {
      return subTabParam;
    } else if (tabParam && tabMapping[tabParam]) {
      return tabMapping[tabParam].sub;
    }

    switch (activePrimaryTab) {
      case "content":
        return "curriculum";
      case "assessments":
        return "assignments";
      case "engagement":
        return "announcements";
      case "roster":
        return "students";
      case "progress":
        return "analytics";
      case "info":
        return "details";
      default:
        return "";
    }
  }, [searchParams, activePrimaryTab, tabMapping]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const subTabParam = searchParams.get("subtab");

    if (tabParam && tabMapping[tabParam] && !subTabParam) {
      const newPrimaryTab = tabMapping[tabParam].primary;
      const newSubTab = tabMapping[tabParam].sub;

      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("tab", newPrimaryTab);
          newParams.set("subtab", newSubTab);
          return newParams;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams, tabMapping]);

  const handlePrimaryTabChange = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("tab", value);
          switch (value) {
            case "content":
              newParams.set("subtab", "curriculum");
              break;
            case "assessments":
              newParams.set("subtab", "assignments");
              break;
            case "engagement":
              newParams.set("subtab", "announcements");
              break;
            case "roster":
              newParams.set("subtab", "students");
              break;
            case "progress":
              newParams.set("subtab", "analytics");
              break;
            case "info":
              newParams.set("subtab", "details");
              break;
            default:
              newParams.delete("subtab");
              break;
          }
          return newParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    activePrimaryTab,
    activeSubTab,
    handlePrimaryTabChange,
    setSearchParams,
  };
};
