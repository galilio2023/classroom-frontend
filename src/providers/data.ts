import {
  DataProvider,
  GetListParams,
  GetListResponse,
  BaseRecord,
} from "@refinedev/core";
// Import the constants we just created
import { mockSubjects } from "./constants";

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    // Logic for your Classroom Subjects
    if (resource === "subjects") {
      return {
        data: mockSubjects as unknown as TData[],
        total: mockSubjects.length,
      };
    }

    return { data: [] as TData[], total: 0 };
  },

  getOne: async () => {
    throw new Error("getOne is not implemented in mock");
  },
  create: async () => {
    throw new Error("create is not implemented in mock");
  },
  update: async () => {
    throw new Error("update is not implemented in mock");
  },
  deleteOne: async () => {
    throw new Error("deleteOne is not implemented in mock");
  },
  getApiUrl: () => "",
};
