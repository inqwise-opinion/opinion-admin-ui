import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';
import { ENV, ERROR_MESSAGES } from '../constants';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (ENV.ENABLE_DEBUG) {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        // Add timestamp for cache busting (similar to original jQuery implementation)
        config.params = {
          ...config.params,
          timestamp: Date.now(),
        };

        return config;
      },
      (error) => {
        if (ENV.ENABLE_DEBUG) {
          console.error('API Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        if (ENV.ENABLE_DEBUG) {
          console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
      },
      (error) => {
        if (ENV.ENABLE_DEBUG) {
          console.error('API Response Error:', error);
        }

        let errorMessage: string = ERROR_MESSAGES.UNKNOWN_ERROR;

        if (error.response) {
          // Server responded with error status
          switch (error.response.status) {
            case 401:
              errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
              break;
            case 403:
              errorMessage = ERROR_MESSAGES.FORBIDDEN;
              break;
            case 404:
              errorMessage = ERROR_MESSAGES.NOT_FOUND;
              break;
            case 422:
              errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
              break;
            case 500:
            case 502:
            case 503:
            case 504:
              errorMessage = ERROR_MESSAGES.SERVER_ERROR;
              break;
            default:
              errorMessage = error.response.data?.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
          }
        } else if (error.request) {
          // Network error
          errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
        }

        return Promise.reject({
          ...error,
          message: errorMessage,
        });
      }
    );
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'NETWORK_ERROR',
          message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          details: error.response?.data,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<T>;
    }
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Set authorization header
  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization header
  clearAuthToken() {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;
