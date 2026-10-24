export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, errors?: Record<string, string[]>, code = 'VALIDATION_ERROR'): ApiError {
    return new ApiError(message, 400, code, errors);
  }

  static unauthorized(message = 'Unauthorized. Please sign in.', code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(message, 401, code);
  }

  static forbidden(message = 'You do not have permission to access this resource.', code = 'FORBIDDEN'): ApiError {
    return new ApiError(message, 403, code);
  }

  static notFound(message = 'Requested resource was not found.', code = 'NOT_FOUND'): ApiError {
    return new ApiError(message, 404, code);
  }

  static conflict(message: string, code = 'CONFLICT'): ApiError {
    return new ApiError(message, 409, code);
  }

  static internal(message = 'An unexpected internal server error occurred.', code = 'INTERNAL_ERROR'): ApiError {
    return new ApiError(message, 500, code);
  }
}
