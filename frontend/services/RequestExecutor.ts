import axios, { AxiosError, AxiosRequestConfig } from "axios";

// 1. Define what our API will always return to the UI
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  error?: string; // Optional message if things go wrong
}

export class RequestExecutor {
  // 2. Hardcoded Base URL as requested
  private static BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

  // 3. Create the static axios instance
  private static client = axios.create({
    baseURL: RequestExecutor.BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  /**
   * 4. AUTH PROVISION (Placeholder)
   * Later, you can uncomment this method to inject the token.
   */
  public static setAuthToken(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // --- Core Methods ---

  /**
   * Generic GET request
   * @param url - endpoint (e.g., '/users')
   */
  static async get<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(() => this.client.get(url, config));
  }

  /**
   * Generic POST request
   * @param url - endpoint
   * @param body - payload data
   */
  static async post<T>(
    url: string,
    body: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    console.log("Api URL:" + this.BASE_URL);
    return this.executeRequest<T>(() =>
      this.client.post(url, body, config)
    );
  }

  /**
   * Generic PUT request
   */
  static async put<T>(
    url: string,
    body: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(() => this.client.put(url, body, config));
  }

  /**
   * Generic DELETE request
   */
  static async delete<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(() => this.client.delete(url, config));
  }

  // --- Internal Helper (Keeps code DRY) ---

  /**
   * Wraps the axios call to standardise the output (Data + Status)
   */
  private static async executeRequest<T>(
    requestFn: () => Promise<any>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn();

      // Success case
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      const err = error as AxiosError;

      // Error case - we return it instead of throwing, so your app doesn't crash
      return {
        data: null as any,
        status: err.response?.status || 500,
        success: false,
        error: err.message,
      };
    }
  }
}
