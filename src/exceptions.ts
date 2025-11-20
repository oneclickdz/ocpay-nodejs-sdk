import { ApiResponse } from './client';

/**
 * Base exception class for all OCPay SDK exceptions
 */
export class OCPayException extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly requestId?: string,
    public readonly errorData?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get the HTTP status code
   */
  getStatusCode(): number | undefined {
    return this.statusCode;
  }

  /**
   * Get the request ID for support
   */
  getRequestId(): string | undefined {
    return this.requestId;
  }

  /**
   * Get the full error data
   */
  getErrorData(): any {
    return this.errorData;
  }
}

/**
 * General API exception
 * Thrown for any API error that doesn't have a more specific exception class
 */
export class ApiException extends OCPayException {
  constructor(
    message: string,
    statusCode?: number,
    requestId?: string,
    errorData?: ApiResponse<any>
  ) {
    super(message, statusCode, requestId, errorData);
  }
}

/**
 * Validation exception (HTTP 400)
 * Thrown when the request data is invalid or fails validation
 */
export class ValidationException extends ApiException {
  constructor(
    message: string,
    statusCode: number = 400,
    requestId?: string,
    errorData?: ApiResponse<any>
  ) {
    super(message, statusCode, requestId, errorData);
  }
}

/**
 * Unauthorized exception (HTTP 403)
 * Thrown when authentication fails or the API key is invalid
 */
export class UnauthorizedException extends ApiException {
  constructor(
    message: string,
    statusCode: number = 403,
    requestId?: string,
    errorData?: ApiResponse<any>
  ) {
    super(message, statusCode, requestId, errorData);
  }
}

/**
 * Not found exception (HTTP 404)
 * Thrown when the requested resource cannot be found
 */
export class NotFoundException extends ApiException {
  constructor(
    message: string,
    statusCode: number = 404,
    requestId?: string,
    errorData?: ApiResponse<any>
  ) {
    super(message, statusCode, requestId, errorData);
  }
}

/**
 * Payment expired exception (HTTP 410)
 * Thrown when a payment link has expired (20 minutes after creation)
 */
export class PaymentExpiredException extends ApiException {
  constructor(
    message: string,
    statusCode: number = 410,
    requestId?: string,
    errorData?: ApiResponse<any>
  ) {
    super(message, statusCode, requestId, errorData);
  }
}
