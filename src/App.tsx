import { useEffect } from "react";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { DevtoolsProvider } from "@refinedev/devtools";
import { BrowserRouter } from "react-router-dom";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { authProvider } from "./providers/auth";
import { accessControlProvider } from "./providers/access-control";
import { resources } from "./config/resources";
import { dataProvider } from "./providers/data";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/error-boundary";
import { AppRouter } from "./routes";

import "./App.css";
import "@excalidraw/excalidraw/index.css";
import "./i18n/i18n";

function App() {
  const { t, i18n } = useTranslation();

  // Enforce RTL direction globally
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language, i18n]);

  const i18nProvider = {
    translate: (key: string, params?: object) => {
      if (!key) return "";

      // 🛡️ Upstream Guard: Robustly handle cases where a segment of a key is 'undefined'.
      // e.g., "classes.undefined.title" -> "classes.general.title"
      if (key.includes("undefined.")) {
        const fallbackKey = key.replace("undefined.", "general.");
        const translatedFallback = t(fallbackKey, { ...params, defaultValue: "" });
        if (translatedFallback) return translatedFallback;
      }

      // Final fallback to the key itself or its basic translation
      return t(key, { ...params, defaultValue: key });
    },
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <DevtoolsProvider>
          <ErrorBoundary>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              routerProvider={routerBindings}
              notificationProvider={useNotificationProvider}
              i18nProvider={i18nProvider}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "classroom-refine",
                title: {
                  icon: <GraduationCap className="w-8 h-8 text-primary" />,
                  text: t("app.title", { defaultValue: "Classroom AI" }),
                },
              }}
            >
              <AppRouter />
              <Toaster />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
              <RefineKbar />
            </Refine>
          </ErrorBoundary>
        </DevtoolsProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
