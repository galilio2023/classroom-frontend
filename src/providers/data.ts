import { DataProvider, HttpError, LogicalFilter } from "@refinedev/core";
import { BACKEND_URL } from "@/config";

const BACKEND_BASE_URL = BACKEND_URL;

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

  // SILENT 401 & 404: We don't want loud toasts for auth checks or missing optional resources
  if (response.status === 401 || response.status === 404) {
    return {
      message: "", // Empty message prevents the toast
      statusCode: response.status,
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
      (json.error as string) || (json.message as string) || `HTTP error! status: ${response.status}`,
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
 * Resource Filter Mappings
 * Decouples frontend UI field names from backend query parameters.
 */
const resourceFilterMappings: Record<string, Record<string, string>> = {
  departments: { name: "search", code: "search" },
  users: { search: "search", name: "search", email: "search", role: "role" },
  subjects: { name: "search", code: "search", department: "departmentId" },
  classes: { name: "search", subject: "subjectId", teacher: "teacherId", status: "status", termId: "termId" },
  enrollments: { classId: "classId", studentId: "studentId", status: "status" },
  assignments: { classId: "classId", moduleId: "moduleId" },
  submissions: { assignmentId: "assignmentId", studentId: "studentId" },
  discussions: { classId: "classId", parentId: "parentId" },
  attendance: { classId: "classId", date: "date" },
  resources: { classId: "classId", moduleId: "moduleId", search: "search" },
  "profile-requests": { status: "status", userId: "userId" },
  quizzes: { classId: "classId", moduleId: "moduleId" },
  modules: { classId: "classId" },
  progress: { classId: "classId", userId: "userId" },
  "users/children": { parentId: "parentId" },
  "teacher-applications": { status: "status", teacherId: "teacherId", classId: "classId" },
  channels: { headline: "headline", teacherId: "teacherId" },
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";
    
    const url = new URL(`${BACKEND_BASE_URL}/${urlPath}`);

    // Pagination: Map to _start and _end for backend compatibility
    if (pagination?.mode !== "off") {
      const current = pagination?.current ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const _start = (current - 1) * pageSize;
      const _end = _start + pageSize;
      url.searchParams.append("_start", _start.toString());
      url.searchParams.append("_end", _end.toString());
    }

    // Filtering: Map operators to backend-compatible suffixes
    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter) {
          const { field, operator, value } = filter as LogicalFilter;
          const mappedField = resourceFilterMappings[resource]?.[field] || field;
          
          let queryKey = mappedField;
          if (operator === "contains") {
            queryKey = `${mappedField}_like`;
          } else if (operator === "gte") {
            queryKey = `${mappedField}_gte`;
          } else if (operator === "lte") {
            queryKey = `${mappedField}_lte`;
          } else if (operator === "ne") {
            queryKey = `${mappedField}_ne`;
          } else if (operator !== "eq") {
            queryKey = `${mappedField}_${operator}`;
          }

          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(queryKey, String(value));
          }
        } else {
            // ⚠️ GOTCHA: ConditionalFilter (OR/AND) not supported by current flat-mapped backend.
            // Suppressing to prevent crash, but logging for developer awareness.
            console.warn("DataProvider: Conditional filters (OR/AND) are not yet supported by the flat-mapping backend.");
        }
      });
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

  getOne: async ({ resource, id }) => {
    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = `${BACKEND_BASE_URL}/${urlPath}/${id}`;
    const response = await fetcher(url);

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data ?? json,
    };
  },

  create: async ({ resource, variables }) => {
    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = `${BACKEND_BASE_URL}/${urlPath}`;
    const response = await fetcher(url, {
      method: "POST",
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data ?? json,
    };
  },

  update: async ({ resource, id, variables }) => {
    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = `${BACKEND_BASE_URL}/${urlPath}/${id}`;
    const response = await fetcher(url, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data ?? json,
    };
  },

  deleteOne: async ({ resource, id }) => {
    let urlPath = resource;
    if (resource === "teacher-channels") urlPath = "channels";
    if (resource === "teacher-subscriptions") urlPath = "enrollments";

    const url = `${BACKEND_BASE_URL}/${urlPath}/${id}`;
    const response = await fetcher(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data || { id },
    };
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
