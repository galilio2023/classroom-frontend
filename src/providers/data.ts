import simpleRestDataProvider from "@refinedev/simple-rest";
import axios from "axios";
// We no longer need toast here, as UI components will handle showing errors.
// import { toast } from "sonner"; 

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create();

// Set withCredentials to true to automatically send cookies with each request.
axiosInstance.defaults.withCredentials = true;

// This interceptor will handle API errors globally.
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // This interceptor's only job is to format the error object consistently.
    // It should NOT have UI side-effects like showing toasts.
    const customError = {
      ...error,
      message: error.response?.data?.message || "Something went wrong",
      statusCode: error.response?.status,
    };

    // DO NOT show a toast here. Let the calling function decide.
    // toast.error(customError.message);

    return Promise.reject(customError);
  }
);

export const dataProvider = simpleRestDataProvider(API_URL, axiosInstance);
