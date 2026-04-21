import { DataProvider, LogicalFilter } from "@refinedev/core";
import { BACKEND_URL } from "@/config";
import { resourceFilterMappings as generatedMappings } from "../generated/resource-metadata";
import { offlineDB } from "../lib/offline-db";
import { toast } from "sonner";
import { getResourcePath } from "./utils/resource-paths";
import { handleError } from "./utils/api-errors";
import { getUUID } from "@/lib/utils";

const BACKEND_BASE_URL = BACKEND_URL;

/**
 * 🛰️ NETWORK SENSE: Helper to check for active connectivity.
 */
const isOffline = () => !navigator.onLine;

/**
 * 🚀 RESILIENT FETCH: Implements Exponential Backoff & Retry-After awareness.
 * Mandate #2: Rural Egypt Resilience.
 */
const fetcherWithRetry = async (
  url: string,
  options?: RequestInit,
  retries = 3,
  backoff = 1000,
  attempt = 0,
): Promise<Response> => {
  const method = options?.method?.toUpperCase() || "GET";
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
    "x-correlation-id": (options?.headers as any)?.["x-correlation-id"] || `client-${getUUID()}`,
  };

  const isFormData = options?.body instanceof FormData;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !isFormData) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  const token = localStorage.getItem("tablawy_auth_token");
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    // 🛡️ RATE LIMITING: Handle 429 with Retry-After Header (Mandate #2)
    if (response.status === 429 && retries > 0) {
      const retryAfterRaw = response.headers.get("Retry-After");
      const retryAfterSeconds = retryAfterRaw ? parseInt(retryAfterRaw, 10) : 0;

      /**
       * 🚀 FULL JITTER BACKOFF (Mandate Review #8)
       * Prevents thundering herds during rural network flaps.
       * sleep = random(0, min(cap, base * 2^attempt))
       */
      const cap = 30000;
      const baseDelay = backoff * Math.pow(2, attempt);
      const jitterDelay = Math.floor(Math.random() * Math.min(cap, baseDelay));

      const delayMs = retryAfterSeconds ? retryAfterSeconds * 1000 : jitterDelay;

      console.warn(`[Rate Limit] Retrying in ${delayMs}ms... (${retries} retries left)`);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetcherWithRetry(url, options, retries - 1, backoff, attempt + 1);
    }

    return response;
  } catch (error) {
    if (retries > 0 && error instanceof TypeError && error.message === "Failed to fetch") {
      const cap = 30000;
      const baseDelay = backoff * Math.pow(2, attempt);
      const delayMs = Math.floor(Math.random() * Math.min(cap, baseDelay));

      console.warn(`[Network Error] Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetcherWithRetry(url, options, retries - 1, backoff, attempt + 1);
    }
    throw error;
  }
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
        const vars = mutation.variables as { id: string | number; version?: number };

        try {
          response = await dataProvider.update({
            resource: mutation.resource,
            id: vars.id,
            variables: mutation.variables as any,
          });
        } catch (err: any) {
          // 🛡️ CONFLICT RESOLUTION: If sync fails with 409, try to get latest version and replay
          if (err.statusCode === 409) {
            console.warn(
              `[Sync Conflict] Mutation ${mutation.id} version mismatch. Attempting recovery...`
            );

            const { data: latestRecord } = await dataProvider.getOne({
              resource: mutation.resource,
              id: vars.id,
            });

            if (latestRecord && (latestRecord as any).version !== undefined) {
              response = await dataProvider.update({
                resource: mutation.resource,
                id: vars.id,
                variables: {
                  ...(mutation.variables as any),
                  version: (latestRecord as any).version,
                } as any,
              });
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      } else if (mutation.action === "delete") {
        const vars = mutation.variables as { id: string | number };
        response = await dataProvider.deleteOne({
          resource: mutation.resource,
          id: vars.id,
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
    const urlPath = getResourcePath(resource);
    const url = new URL(`${BACKEND_BASE_URL}/${urlPath}`);

    const withRelations = meta?.with || meta?.populate;
    if (withRelations) {
      if (typeof withRelations === "string") {
        url.searchParams.append("_with", withRelations);
      } else {
        url.searchParams.append("_with", JSON.stringify(withRelations));
      }
    }

    if (pagination?.mode !== "off") {
      const current = (pagination as any)?.current ?? 1;
      const pageSize = (pagination as any)?.pageSize ?? 10;
      const _start = (current - 1) * pageSize;
      const _end = _start + pageSize;
      url.searchParams.append("_start", _start.toString());
      url.searchParams.append("_end", _end.toString());
    }

    if (filters && filters.length > 0) {
      const hasComplexFilters = filters.some((f) => !("field" in f));

      if (hasComplexFilters) {
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

    if (sorters && sorters.length > 0) {
      url.searchParams.append("_sort", sorters[0].field);
      url.searchParams.append("_order", sorters[0].order);
    }

    const response = await fetcherWithRetry(url.toString());

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    const data = json.data ?? (Array.isArray(json) ? json : []);
    const total = json.pagination?.total ?? data.length;

    return { data, total };
  },

  getOne: async ({ resource, id, meta }) => {
    const urlPath = getResourcePath(resource);
    const url = new URL(`${BACKEND_BASE_URL}/${urlPath}/${id}`);

    const withRelations = meta?.with || meta?.populate;
    if (withRelations) {
      if (typeof withRelations === "string") {
        url.searchParams.append("_with", withRelations);
      } else {
        url.searchParams.append("_with", JSON.stringify(withRelations));
      }
    }

    const response = await fetcherWithRetry(url.toString());

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
      await offlineDB.queue({
        resource,
        action: "create",
        variables: variables as any,
        meta: meta as any,
      });
      toast.warning(
        "📴 Offline: Your changes are saved locally and will sync when you're back online."
      );
      return { data: { ...variables, id: `offline-${Date.now()}` } as any };
    }

    const urlPath = getResourcePath(resource);
    const url = `${BACKEND_BASE_URL}/${urlPath}`;
    try {
      const response = await fetcherWithRetry(url, {
        method: "POST",
        body: JSON.stringify(variables),
      });

      if (!response.ok) throw await handleError(response);

      const json = await response.json();
      return { data: json.data ?? json };
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        await offlineDB.queue({
          resource,
          action: "create",
          variables: variables as any,
          meta: meta as any,
        });
        toast.warning("📴 Network failed: Mutation queued for retry.");
        return { data: { ...variables, id: `offline-${Date.now()}` } as any };
      }
      throw err;
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    if (isOffline()) {
      await offlineDB.queue({
        resource,
        action: "update",
        variables: { ...(variables as any), id },
        meta: meta as any,
      });
      toast.warning("📴 Offline: Edit saved locally.");
      return { data: { ...variables, id } as any };
    }

    const urlPath = getResourcePath(resource);
    const url = `${BACKEND_BASE_URL}/${urlPath}/${id}`;

    const finalVariables: any = { ...variables };
    if (finalVariables.version === undefined && meta?.version !== undefined) {
      finalVariables.version = meta.version;
    }

    try {
      const response = await fetcherWithRetry(url, {
        method: "PATCH",
        body: JSON.stringify(finalVariables),
      });

      if (!response.ok) throw await handleError(response);

      const json = await response.json();
      return { data: json.data ?? json };
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        await offlineDB.queue({
          resource,
          action: "update",
          variables: { ...(variables as any), id },
          meta: meta as any,
        });
        toast.warning("📴 Network failed: Update queued.");
        return { data: { ...variables, id } as any };
      }
      throw err;
    }
  },

  deleteOne: async ({ resource, id, meta }) => {
    if (isOffline()) {
      await offlineDB.queue({
        resource,
        action: "delete",
        variables: { id } as any,
        meta: meta as any,
      });
      toast.warning("📴 Offline: Delete will sync when online.");
      return { data: { id } as any };
    }

    const urlPath = getResourcePath(resource);
    const url = `${BACKEND_BASE_URL}/${urlPath}/${id}`;
    try {
      const response = await fetcherWithRetry(url, {
        method: "DELETE",
      });

      if (!response.ok) throw await handleError(response);

      const json = await response.json();
      return { data: json.data || { id } };
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        await offlineDB.queue({
          resource,
          action: "delete",
          variables: { id } as any,
          meta: meta as any,
        });
        toast.warning("📴 Network failed: Delete queued.");
        return { data: { id } as any };
      }
      throw err;
    }
  },

  getApiUrl: () => BACKEND_BASE_URL,

  getMany: async ({ resource, ids }) => {
    const urlPath = getResourcePath(resource);
    const url = new URL(`${BACKEND_BASE_URL}/${urlPath}`);
    ids.forEach((id) => {
      url.searchParams.append("id", String(id));
    });

    const response = await fetcherWithRetry(url.toString());

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

  custom: async ({ url, method, payload, query, headers, meta }) => {
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

    const response = await fetcherWithRetry(requestUrl, {
      method: method ? method.toUpperCase() : "GET",
      body: payload instanceof FormData ? payload : payload ? JSON.stringify(payload) : undefined,
      headers: headers as Record<string, string>,
      signal: meta?.signal,
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
