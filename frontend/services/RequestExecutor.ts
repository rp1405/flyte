import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 1. Import Storage

// Define what our API will always return to the UI
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  error?: string;
}

export class RequestExecutor {
  private static BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

  // Create the static axios instance
  private static client = axios.create({
    baseURL: RequestExecutor.BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  // --- THE FIX: AXIOS INTERCEPTOR ---
  // This static block runs once when the class is loaded.
  // It sets up a listener that runs BEFORE every request.
  static {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          // 1. Read the token from storage (saved by your AuthContext)
          const token = await AsyncStorage.getItem("userToken");

          // 2. If token exists, inject it into headers
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error reading token in interceptor", error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  // --- Core Methods ---

  /**
   * Generic GET request
   */
  static async get<T>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(() => this.client.get(url, config));
  }

  /**
   * Generic POST request
   */
  static async post<T>(
    url: string,
    body: unknown,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    // Debug log to verify URL if needed
    // console.log("Api URL:", this.BASE_URL + url);
    return this.executeRequest<T>(() => this.client.post(url, body, config));
  }

  /**
   * Generic PUT request
   */
  static async put<T>(
    url: string,
    body: unknown,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(() => this.client.put(url, body, config));
  }

  /**
   * Generic DELETE request
   */
  static async delete<T>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(() => this.client.delete(url, config));
  }

  // --- Internal Helper ---

  private static async executeRequest<T>(
    requestFn: () => Promise<any>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn();

      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      const err = error as AxiosError;

      // Optional: Log specific auth errors here
      if (err.response?.status === 401) {
        console.warn("Unauthorized! Token might be expired.");
      }

      return {
        data: null as any,
        status: err.response?.status || 500,
        success: false,
        error: err.message,
      };
    }
  }
}
