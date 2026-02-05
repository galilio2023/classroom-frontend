import simpleRestDataProvider from "@refinedev/simple-rest";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { DataProvider } from "@refinedev/core";

// 1. Create a custom Axios instance
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  // Future auth token logic goes here
  return config;
});

// 2. Get the base provider, which we will use for non-list methods
const baseDataProvider = simpleRestDataProvider(BACKEND_URL, axiosInstance);

// 3. Create our final data provider
export const dataProvider: DataProvider = {
  ...baseDataProvider, // Use the default for getOne, create, update, etc.

  // Override getList to handle our custom API response structure
  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = `${BACKEND_URL}/${resource}`;

    // 1. Set up query parameters for pagination
    // Refine's pagination object has `current` and `pageSize`.
    // We map them to what our backend expects: `page` and `limit`.
    const queryParams: Record<string, any> = {
      page: pagination?.currentPage || 1,
      limit: pagination?.pageSize || 10,
    };

    // 2. Handle filters (like search)
    if (filters) {
      filters.forEach((filter) => {
        if (
          "field" in filter &&
          (filter.operator === "eq" || filter.operator === "contains")
        ) {
          queryParams[filter.field] = filter.value;
        }
      });
    }

    // 3. Handle sorters
    if (sorters && sorters.length > 0) {
      // Assuming your API takes `_sort` and `_order` for sorting
      queryParams._sort = sorters[0].field;
      queryParams._order = sorters[0].order;
    }

    // 4. Make the API call
    const { data } = await axiosInstance.get(url, {
      params: queryParams,
    });

    // 5. Return the data in the format Refine's useList hook expects
    return {
      data: data.data, // The array of items from our backend response
      total: Number(data.pagination.total), // The total count from our backend response
    };
  },
};
