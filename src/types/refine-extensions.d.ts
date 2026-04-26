import { CreateResponse } from "@refinedev/core";

declare module "@refinedev/core" {
  export interface CreateResponse<TData = any> {
    statusCode?: number;
  }
}

/**
 * 🚀 ARCHITECTURAL PATTERN: Tablawy OS uses a "202 Accepted" pattern for long-running AI jobs.
 * This interface extends the standard Refine response to capture the background jobId.
 */
export interface TablawyCreateResponse<TData = any> extends CreateResponse<TData> {
  statusCode?: number;
}
