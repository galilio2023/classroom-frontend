import { DataProvider, HttpError } from "@refinedev/core";
import { CreateResponse, GetOneResponse, ListResponse } from "@/types";

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Helper to handle API errors and return Refine-compatible HttpError
 */
const handleError = async (response: Response): Promise<HttpError> => {
  try {
    const json = await response.json();
    
    // If backend returned Zod validation details (Layer 3)
    if (json.details) {
      return {
        message: json.error || "Validation failed",
        statusCode: response.status,
        errors: json.details, // Maps to Refine's form errors
      };
    }

    // Standardized error message from Layer 1/3
    return {
      message: json.error || json.message || `HTTP error! status: ${response.status}`,
      statusCode: response.status,
    };
  } catch (e) {
    return {
      message: `HTTP error! status: ${response.status}`,
      statusCode: response.status,
    };
  }
};

const fetcher = async (url: string, options?: RequestInit) => {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
    },
  });
};

const resourceFilterMappings: Record<string, Record<string, string>> = {
  departments: { name: "search", code: "search" },
  users: { search: "search", name: "search", email: "search" },
  subjects: { name: "search", code: "search", department: "department" },
  classes: { name: "search", subject: "subject", teacher: "teacher" },
  enrollments: { classId: "classId" },
  assignments: { classId: "classId" },
  submissions: { assignmentId: "assignmentId" },
  discussions: { classId: "classId" },
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters }) => {
    const url = new URL(`${BACKEND_BASE_URL}/${resource}`);

    if (pagination?.mode !== "off") {
      url.searchParams.append("page", (pagination?.currentPage ?? 1).toString());
      url.searchParams.append("limit", (pagination?.pageSize ?? 10).toString());
    }

    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter) {
          const mappedField = resourceFilterMappings[resource]?.[filter.field] || filter.field;
          url.searchParams.append(mappedField, String(filter.value));
        }
      });
    }

    const response = await fetcher(url.toString());

    if (!response.ok) {
      throw await handleError(response);
    }

    const json: ListResponse = await response.json();
    
    // Layer 3: Backend now returns { success: true, data: [], pagination: {} }
    return {
      data: json.data ?? [],
      total: json.pagination?.total ?? json.data?.length ?? 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url);

    if (!response.ok) {
      throw await handleError(response);
    }

    const json: GetOneResponse = await response.json();
    return {
      data: json.data,
    };
  },

  create: async ({ resource, variables }) => {
    const url = `${BACKEND_BASE_URL}/${resource}`;
    const response = await fetcher(url, {
      method: "POST",
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json: CreateResponse = await response.json();
    return {
      data: json.data,
    };
  },

  update: async ({ resource, id, variables }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    
    // Layer 5: Backend returns the soft-deleted object
    return {
      data: json.data || { id },
    };
  },

  getApiUrl: () => BACKEND_BASE_URL,
  
  getMany: async () => { throw new Error("getMany not implemented"); },
  createMany: async () => { throw new Error("createMany not implemented"); },
  deleteMany: async () => { throw new Error("deleteMany not implemented"); },
  updateMany: async () => { throw new Error("updateMany not implemented"); },
  
  custom: async ({ url, method, payload, query, headers }) => {
     let requestUrl = url.startsWith("/") ? `${BACKEND_BASE_URL}${url}` : url;
     
     if (query) {
        const searchParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        const separator = requestUrl.includes("?") ? "&" : "?";
        requestUrl += `${separator}${searchParams.toString()}`;
     }

     const response = await fetcher(requestUrl, {
        method: method || "GET",
        body: payload ? JSON.stringify(payload) : undefined,
        headers: headers as any
     });

     if (!response.ok) {
        throw await handleError(response);
     }
     
     const json = await response.json();
     
     // Layer 3: Standardized response check
     if (json && typeof json === 'object' && 'data' in json) {
         return json;
     }
     return { data: json };
  }
};
