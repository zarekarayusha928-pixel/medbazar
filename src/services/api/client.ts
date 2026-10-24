import { ApiErrorData } from '@/types';

/**
 * Standard API error class encapsulating HTTP status, error codes, and field-level validation errors.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isValidationError(): boolean {
    return this.statusCode === 400 || this.statusCode === 422;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0 || this.code === 'NETWORK_ERROR';
  }
}

/**
 * Token management
 */
const TOKEN_KEY = 'medbazar_auth_token';
const MOCK_MODE_KEY = 'medbazar_mock_mode';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Mock Switch:
 * Evaluates whether Med Bazar operates in Mock Mode or Real API Mode.
 * Defaults to true if VITE_USE_MOCK !== 'false' or if VITE_API_URL is unset.
 */
export const isMockMode = (): boolean => {
  const localOverride = localStorage.getItem(MOCK_MODE_KEY);
  if (localOverride !== null) {
    return localOverride === 'true';
  }
  const envMock = import.meta.env.VITE_USE_MOCK;
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envMock === 'false') {
    return false;
  }
  if (!envApiUrl || envApiUrl.trim() === '') {
    return true;
  }
  return envMock !== 'false';
};

export const setMockMode = (enabled: boolean): void => {
  localStorage.setItem(MOCK_MODE_KEY, String(enabled));
  // Dispatch event so UI can react without full reload
  window.dispatchEvent(new CustomEvent('medbazar:mock-mode-changed', { detail: { enabled } }));
};

/**
 * Simulated latency helper for mock mode
 */
export const mockDelay = (ms = 150): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Centralized HTTP client
 */
export class HttpClient {
  private getBaseUrl(): string {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && envUrl.trim().length > 0) {
      return envUrl.replace(/\/+$/, '');
    }
    return '/api/v1';
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = this.getBaseUrl();
    const url = new URL(`${baseUrl}${cleanEndpoint}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);
    const token = getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        clearAuthToken();
        window.dispatchEvent(new CustomEvent('medbazar:unauthorized'));
        throw new ApiError('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new ApiError('You do not have permission to perform this action.', 403, 'FORBIDDEN');
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new ApiError('The requested resource was not found.', 404, 'NOT_FOUND');
      }

      // Parse JSON response
      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json().catch(() => null);
      }

      // Handle 400 / 422 Validation Errors
      if (response.status === 400 || response.status === 422) {
        const errorData: ApiErrorData = responseData || {};
        throw new ApiError(
          errorData.message || 'Validation failed. Please review your entries.',
          response.status,
          errorData.code || 'VALIDATION_ERROR',
          errorData.errors
        );
      }

      // Handle other HTTP errors (500+)
      if (!response.ok) {
        const message = responseData?.message || `Request failed with status ${response.status}`;
        throw new ApiError(message, response.status, responseData?.code || 'SERVER_ERROR');
      }

      // Unwrap standard API envelope if response has `{ success: true, data: ... }`
      if (responseData && typeof responseData === 'object' && 'data' in responseData && 'success' in responseData) {
        return responseData.data as T;
      }

      return (responseData ?? ({} as unknown)) as T;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }

      // Handle network errors (offline, CORS, refused connection)
      const isTypeError = err instanceof TypeError;
      const message = isTypeError
        ? 'Unable to connect to server. Please verify your network connection.'
        : (err as Error)?.message || 'An unexpected error occurred.';

      throw new ApiError(message, 0, 'NETWORK_ERROR');
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new HttpClient();
