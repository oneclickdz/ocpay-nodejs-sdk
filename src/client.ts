import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ApiException,
  ValidationException,
  UnauthorizedException,
  NotFoundException,
  PaymentExpiredException,
} from './exceptions';

/**
 * Configuration options for the API client
 */
export interface ClientOptions {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom base URL (mainly for testing) */
  baseURL?: string;
  /** Additional headers to include in requests */
  headers?: Record<string, string>;
}

/**
 * API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

/**
 * Main HTTP client for OneClickDz OCPay API
 *
 * Handles all HTTP communication with the API, including request/response
 * processing and error handling.
 */
export class Client {
  private static readonly BASE_URL = 'https://api.oneclickdz.com';
  private static readonly HEADER_ACCESS_TOKEN = 'X-Access-Token';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';
  private static readonly CONTENT_TYPE_JSON = 'application/json';

  private readonly httpClient: AxiosInstance;
  private readonly accessToken: string;

  /**
   * Create a new API client instance
   *
   * @param accessToken Your OneClickDz API access token
   * @param options Additional client configuration options
   */
  constructor(accessToken: string, options: ClientOptions = {}) {
    this.accessToken = accessToken;

    this.httpClient = axios.create({
      baseURL: options.baseURL || Client.BASE_URL,
      timeout: options.timeout || 30000,
      headers: {
        [Client.HEADER_ACCESS_TOKEN]: this.accessToken,
        [Client.HEADER_CONTENT_TYPE]: Client.CONTENT_TYPE_JSON,
        ...options.headers,
      },
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        throw this.handleException(error);
      }
    );
  }

  /**
   * Make a POST request to the API
   *
   * @param endpoint API endpoint (e.g., '/v3/ocpay/createLink')
   * @param data Request body data
   * @returns Decoded JSON response
   * @throws ApiException
   */
  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await this.httpClient.post<ApiResponse<T>>(endpoint, data);
    return this.handleResponse(response.data);
  }

  /**
   * Make a GET request to the API
   *
   * @param endpoint API endpoint (e.g., '/v3/ocpay/checkPayment/OCPL-XXX')
   * @returns Decoded JSON response
   * @throws ApiException
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.httpClient.get<ApiResponse<T>>(endpoint);
    return this.handleResponse(response.data);
  }

  /**
   * Handle API response
   *
   * @param data Response data
   * @returns Validated response
   * @throws ApiException
   */
  private handleResponse<T>(data: ApiResponse<T>): ApiResponse<T> {
    // Check if response indicates an error
    if (data.success === false) {
      const message = data.message || 'API request failed';
      const requestId = data.meta?.requestId;

      throw new ApiException(message, 0, requestId, data);
    }

    return data;
  }

  /**
   * Handle HTTP exceptions and convert to appropriate API exceptions
   *
   * @param error Axios error
   * @returns Appropriate API exception
   */
  private handleException(error: AxiosError): ApiException {
    const response = error.response;
    const statusCode = response?.status || 0;
    const data = response?.data as ApiResponse<any> | undefined;
    const requestId = data?.meta?.requestId;
    const message = data?.message || error.message;

    switch (statusCode) {
      case 400:
        return new ValidationException(message, statusCode, requestId, data);
      case 403:
        return new UnauthorizedException(message, statusCode, requestId, data);
      case 404:
        return new NotFoundException(message, statusCode, requestId, data);
      case 410:
        return new PaymentExpiredException(message, statusCode, requestId, data);
      default:
        return new ApiException(message, statusCode, requestId, data);
    }
  }
}
