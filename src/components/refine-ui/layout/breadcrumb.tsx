"use client";

import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbList as ShadcnBreadcrumbList,
  BreadcrumbPage as ShadcnBreadcrumbPage,
  BreadcrumbSeparator as ShadcnBreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  matchResourceFromRoute,
  useBreadcrumb,
  useLink,
  useResourceParams,
} from "@refinedev/core";
import { Home } from "lucide-react";
import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";

export function Breadcrumb() {
  const Link = useLink();
  const { breadcrumbs } = useBreadcrumb();
  const { resources } = useResourceParams();
  const { t } = useTranslation();
  const rootRouteResource = matchResourceFromRoute("/", resources);

  const breadCrumbItems = useMemo(() => {
    const list: {
      key: string;
      href: string;
      Component: React.ReactNode;
    }[] = [];

    list.push({
      key: "breadcrumb-item-home",
      href: rootRouteResource.matchedRoute ?? "/",
      Component: (
        <Link to={rootRouteResource.matchedRoute ?? "/"}>
          {rootRouteResource?.resource?.meta?.icon ?? (
            <Home className="h-4 w-4" />
          )}
        </Link>
      ),
    });

    for (const { label, href, icon } of breadcrumbs) {
      // Try to translate the label if it matches a resource key or common term
      const translatedLabel = t(label, { defaultValue: label });

      list.push({
        key: `breadcrumb-item-${label}`,
        href: href ?? "",
        Component: href ? (
          <Link to={href} className="flex items-center gap-2">
            {icon && <span className="mr-1">{icon}</span>}
            {translatedLabel}
          </Link>
        ) : (
          <span className="flex items-center gap-2">
            {icon && <span className="mr-1">{icon}</span>}
            {translatedLabel}
          </span>
        ),
      });
    }

    return list;
  }, [breadcrumbs, Link, rootRouteResource, t]);

  return (
    <ShadcnBreadcrumb>
      <ShadcnBreadcrumbList>
        {breadCrumbItems.map((item, index) => {
          if (index === breadCrumbItems.length - 1) {
            return (
              <ShadcnBreadcrumbPage key={item.key}>
                {item.Component}
              </ShadcnBreadcrumbPage>
            );
          }

          return (
            <Fragment key={item.key}>
              <ShadcnBreadcrumbItem key={item.key}>
                {item.Component}
              </ShadcnBreadcrumbItem>
              <ShadcnBreadcrumbSeparator />
            </Fragment>
          );
        })}
      </ShadcnBreadcrumbList>
    </ShadcnBreadcrumb>
  );
}

Breadcrumb.displayName = "Breadcrumb";
