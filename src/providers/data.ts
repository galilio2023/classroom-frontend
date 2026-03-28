import { DataProvider, HttpError, LogicalFilter } from "@refinedev/core";
import { BACKEND_URL } from "@/config";
import { resourceFilterMappings as generatedMappings } from "../generated/resource-metadata";
import { offlineDB } from "../lib/offline-db";
import { toast } from "sonner";

const BACKEND_BASE_URL = BACKEND_URL;

/**
 * 🛰️ NETWORK SENSE: Helper to check for active connectivity.
 */
const isOffline = () => !navigator.onLine;

/**
 * Helper to handle API errors and return Refine-compatible HttpError
 */
const handleError = async (response: Response): Promise<HttpError> => {
  let json: Record<string, unknown> = {};
  try {
    const text = await response.text();
    if (text) {
      json = JSON.parse(text);
    }
  } catch {
    // Not JSON or empty
  }

  // 🛡️ SECURITY & UX: Provide meaningful messages for common errors
  if (response.status === 401) {
    return {
      message: "Session expired or unauthorized. Please log in.",
      statusCode: 401,
    };
  }

  if (response.status === 404) {
    return {
      message: "The requested resource was not found.",
      statusCode: 404,
    };
  }

  if (json.details) {
    return {
      message: (json.error as string) || "Validation failed",
      statusCode: response.status,
      errors: json.details as Record<string, string>,
    };
  }

  return {
    message:
      (json.error as string) ||
      (json.message as string) ||
      `HTTP error! status: ${response.status}`,
    statusCode: response.status,
  };
};

/**
 * Smart Fetcher: Only adds Content-Type for methods with a body.
 */
const fetcher = async (url: string, options?: RequestInit) => {
  const method = options?.method?.toUpperCase() || "GET";
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers["Content-Type"] = "application/json";
  }

  // 🛡️ DUAL AUTH: Better Auth (Cookies) + Bearer Token (Authorization Header)
  const token = localStorage.getItem("token");
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    credentials: "include",
    headers: headers,
  });
};

/**
 * 📦 OUTBOX FLUSHER
 * Automatically replays pending mutations when the network returns.
 */
export const flushOutbox = async () => {
  if (isOffline()) return;

  const pending = await offlineDB.getPending();
  if (pending.length === 0) return;

  toast.info(`🔄 Syncing ${pending.length} offline changes...`);

  for (const mutation of pending) {
    try {
      let response;
      if (mutation.action === "create") {
        response = await dataProvider.create({
          resource: mutation.resource,
          variables: mutation.variables,
        });
      } else if (mutation.action === "update") {
        response = await dataProvider.update({
          resource: mutation.resource,
          id: mutation.variables.id,
          variables: mutation.variables,
        });
      } else if (mutation.action === "delete") {
        response = await dataProvider.deleteOne({
          resource: mutation.resource,
          id: mutation.variables.id,
        });
      }

      if (response) {
        await offlineDB.resolve(mutation.id!);
      }
    } catch (err) {
      console.error(`Failed to sync mutation ${mutation.id}`, err);
      // Stop flushing if we hit a persistent error (e.g. 401) to avoid infinite loops
      break;
    }
  }

  toast.success("✅ Offline sync complete.");
};

// Listen for reconnection
if (typeof window !== "undefined") {
  window.addEventListener("online", () => void flushOutbox());
}

/**
 * Resource Filter Mappings
 * Standardized mappings for specific UI fields that don't match backend column names.
 * RESOURCES NO LONGER NEEDED HERE: departments, users, subjects, classes, resources.
 */
export const resourceFilterMappings: Record<string, any> = {
  ...generatedMappings,
  "teacher-applications": {
    teacherId: "teacherId",
    classId: "classId",
  },
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = new URL(`${BACKEND_BASE_URL}/${urlPath}`);

    // Relations: Support meta.with or meta.populate for dynamic embedding
    const withRelations = meta?.with || meta?.populate;
    if (withRelations) {
      if (typeof withRelations === "string") {
        url.searchParams.append("_with", withRelations);
      } else {
        url.searchParams.append("_with", JSON.stringify(withRelations));
      }
    }

    // Pagination: Map to _start and _end for backend compatibility
    if (pagination?.mode !== "off") {
      const current = (pagination as any)?.current ?? 1;
      const pageSize = (pagination as any)?.pageSize ?? 10;
      const _start = (current - 1) * pageSize;
      const _end = _start + pageSize;
      url.searchParams.append("_start", _start.toString());
      url.searchParams.append("_end", _end.toString());
    }

    // Filtering: Support both flat and recursive (OR/AND) filters
    if (filters && filters.length > 0) {
      const hasComplexFilters = filters.some((f) => !("field" in f));

      if (hasComplexFilters) {
        // 🚀 ADVANCED: Send all filters as a JSON string for the backend to parse recursively
        const mappedFilters = filters.map((filter) => {
          if ("field" in filter) {
            return {
              ...filter,
              field: resourceFilterMappings[resource]?.[filter.field] || filter.field,
            };
          }
          return filter;
        });
        url.searchParams.append("_filters", JSON.stringify(mappedFilters));
      } else {
        // 🕵️ LEGACY/SIMPLE: Map operators to backend-compatible suffixes for flat query params
        filters.forEach((filter) => {
          if ("field" in filter) {
            const { field, operator, value } = filter as LogicalFilter;
            const mappedField = resourceFilterMappings[resource]?.[field] || field;

            let queryKey = mappedField;
            if (operator === "contains") {
              queryKey = resourceFilterMappings[resource]?.[field]
                ? `${mappedField}_like`
                : "search";
            } else if (operator === "gte") {
              queryKey = `${mappedField}_gte`;
            } else if (operator === "lte") {
              queryKey = `${mappedField}_lte`;
            } else if (operator === "ne") {
              queryKey = `${mappedField}_ne`;
            } else if (operator === "in") {
              queryKey = `${mappedField}_in`;
            } else if (operator !== "eq") {
              queryKey = `${mappedField}_${operator}`;
            }

            if (value !== undefined && value !== null && value !== "") {
              url.searchParams.append(queryKey, String(value));
            }
          }
        });
      }
    }

    // Sorting: Map to _sort and _order (single sort supported by current backend)
    if (sorters && sorters.length > 0) {
      url.searchParams.append("_sort", sorters[0].field);
      url.searchParams.append("_order", sorters[0].order);
    }

    const response = await fetcher(url.toString());

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    const data = json.data ?? (Array.isArray(json) ? json : []);
    const total = json.pagination?.total ?? data.length;

    return { data, total };
  },

  getOne: async ({ resource, id, meta }) => {
    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = new URL(`${BACKEND_BASE_URL}/${urlPath}/${id}`);

    // Relations: Support meta.with or meta.populate for dynamic embedding
    const withRelations = meta?.with || meta?.populate;
    if (withRelations) {
      if (typeof withRelations === "string") {
        url.searchParams.append("_with", withRelations);
      } else {
        url.searchParams.append("_with", JSON.stringify(withRelations));
      }
    }

    const response = await fetcher(url.toString());

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data ?? json,
    };
  },

  create: async ({ resource, variables, meta }) => {
    if (isOffline()) {
      await offlineDB.queue({ resource, action: "create", variables, meta });
      toast.warning(
        "📴 Offline: Your changes are saved locally and will sync when you're back online."
      );
      return { data: { ...variables, id: `offline-${Date.now()}` } as any };
    }

    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = `${BACKEND_BASE_URL}/${urlPath}`;
    try {
      const response = await fetcher(url, {
        method: "POST",
        body: JSON.stringify(variables),
      });

      if (!response.ok) throw await handleError(response);

      const json = await response.json();
      return { data: json.data ?? json };
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        await offlineDB.queue({ resource, action: "create", variables, meta });
        toast.warning("📴 Network failed: Mutation queued for retry.");
        return { data: { ...variables, id: `offline-${Date.now()}` } as any };
      }
      throw err;
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    if (isOffline()) {
      await offlineDB.queue({ resource, action: "update", variables: { ...variables, id }, meta });
      toast.warning("📴 Offline: Edit saved locally.");
      return { data: { ...variables, id } as any };
    }

    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = `${BACKEND_BASE_URL}/${urlPath}/${id}`;
    try {
      const response = await fetcher(url, {
        method: "PATCH",
        body: JSON.stringify(variables),
      });

      if (!response.ok) throw await handleError(response);

      const json = await response.json();
      return { data: json.data ?? json };
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        await offlineDB.queue({
          resource,
          action: "update",
          variables: { ...variables, id },
          meta,
        });
        toast.warning("📴 Network failed: Update queued.");
        return { data: { ...variables, id } as any };
      }
      throw err;
    }
  },

  deleteOne: async ({ resource, id, meta }) => {
    if (isOffline()) {
      await offlineDB.queue({ resource, action: "delete", variables: { id }, meta });
      toast.warning("📴 Offline: Delete will sync when online.");
      return { data: { id } as any };
    }

    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = `${BACKEND_BASE_URL}/${urlPath}/${id}`;
    try {
      const response = await fetcher(url, {
        method: "DELETE",
      });

      if (!response.ok) throw await handleError(response);

      const json = await response.json();
      return { data: json.data || { id } };
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        await offlineDB.queue({ resource, action: "delete", variables: { id }, meta });
        toast.warning("📴 Network failed: Delete queued.");
        return { data: { id } as any };
      }
      throw err;
    }
  },

  getApiUrl: () => BACKEND_BASE_URL,

  getMany: async ({ resource, ids }) => {
    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = new URL(`${BACKEND_BASE_URL}/${urlPath}`);
    ids.forEach((id) => {
      url.searchParams.append("id", String(id));
    });

    const response = await fetcher(url.toString());

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    const data = json.data ?? (Array.isArray(json) ? json : []);
    return { data };
  },

  createMany: async () => {
    throw new Error("createMany not implemented");
  },
  deleteMany: async () => {
    throw new Error("deleteMany not implemented");
  },
  updateMany: async () => {
    throw new Error("updateMany not implemented");
  },

  custom: async ({ url, method, payload, query, headers }) => {
    let requestUrl = url;

    if (!url.startsWith("http")) {
      if (url.startsWith("/")) {
        requestUrl = `${BACKEND_BASE_URL}${url}`;
      } else {
        requestUrl = `${BACKEND_BASE_URL}/${url}`;
      }
    }

    if (query) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      const separator = requestUrl.includes("?") ? "&" : "?";
      requestUrl += `${separator}${searchParams.toString()}`;
    }

    const response = await fetcher(requestUrl, {
      method: method ? method.toUpperCase() : "GET",
      body: payload ? JSON.stringify(payload) : undefined,
      headers: headers as Record<string, string>,
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    if (json && typeof json === "object" && "data" in json) {
      return json;
    }
    return { data: json };
  },
};
