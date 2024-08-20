import { HttpStatusCode } from './HttpStatusCode';

/** Interface for error messages, defining the structure and methods for error handling. */
export interface ErrorMsg {
  /**
   * Retrieves the error message.
   *
   * @returns {string} The error message.
   */
  getMsg(): string;

  /**
   * Retrieves the HTTP status code associated with the error.
   *
   * @returns {HttpStatusCode} The HTTP status code.
   */
  getStatusCode(): HttpStatusCode;

  /**
   * Sets additional details for the error.
   *
   * @param {string} [details] - Optional details about the error.
   * @returns {ErrorMsg} The current instance with updated details.
   */
  setDetails(details?: string): ErrorMsg;

  /**
   * Sets the underlying error detail.
   *
   * @param {Error} [error] - Optional underlying error.
   * @returns {ErrorMsg} The current instance with updated error detail.
   */
  setErrorDetail(error?: Error): ErrorMsg;

  /**
   * Converts the error to a JSON representation.
   *
   * @returns {object} The JSON representation of the error.
   */
  toJSON(): {
    message: string;
    code: HttpStatusCode;
    details?: string;
    error?: Error;
  };

  success: boolean;
  message: string;
  code: HttpStatusCode;
  details?: string;
  error?: Error;
}

/** Base class for errors, implementing the ErrorMsg interface. */
class BaseError extends Error implements ErrorMsg {
  success: boolean;
  code: HttpStatusCode;
  details?: string;
  error?: Error;

  /**
   * Constructs a new BaseError instance.
   *
   * @param {string} message - The error message.
   * @param {HttpStatusCode} code - The HTTP status code.
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(message: string, code: HttpStatusCode, details?: string, error?: Error) {
    super(message);
    this.success = false;
    this.code = code;
    this.details = details;
    this.error = error;
  }

  /**
   * Retrieves the error message.
   *
   * @returns {string} The error message.
   */
  getMsg(): string {
    return this.message;
  }

  /**
   * Retrieves the HTTP status code associated with the error.
   *
   * @returns {HttpStatusCode} The HTTP status code.
   */
  getStatusCode(): HttpStatusCode {
    return this.code;
  }

  /**
   * Sets additional details for the error.
   *
   * @param {string} [details] - Optional details about the error.
   * @returns {ErrorMsg} The current instance with updated details.
   */
  setDetails(details?: string): ErrorMsg {
    this.details = details;
    return this;
  }

  /**
   * Sets the underlying error detail.
   *
   * @param {Error} [error] - Optional underlying error.
   * @returns {ErrorMsg} The current instance with updated error detail.
   */
  setErrorDetail(error?: Error): ErrorMsg {
    this.error = error;
    return this;
  }

  /**
   * Converts the error to a JSON representation.
   *
   * @returns {object} The JSON representation of the error.
   */
  toJSON() {
    return {
      success: this.success,
      message: this.message,
      code: this.code,
      details: this.details,
      error: this.error,
    };
  }
}

/** Error class for Bad Request errors (HTTP 400). */
export class BadRequestError extends BaseError {
  /**
   * Constructs a new BadRequestError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Bad request... Fix and retry...', HttpStatusCode.BadRequest, details, error);
  }
}

/** Error class for Unauthorized errors (HTTP 401). */
export class UnauthorizedError extends BaseError {
  /**
   * Constructs a new UnauthorizedError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Unauthorized.', HttpStatusCode.Unauthorized, details, error);
  }
}

/** Error class for Forbidden errors (HTTP 403). */
export class ForbiddenError extends BaseError {
  /**
   * Constructs a new ForbiddenError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Forbidden, No rights...', HttpStatusCode.Forbidden, details, error);
  }
}

/** Error class for Not Found errors (HTTP 404). */
export class NotFoundError extends BaseError {
  /**
   * Constructs a new NotFoundError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Not Found, Resource not found.', HttpStatusCode.NotFound, details, error);
  }
}

/** Error class for Method Not Allowed errors (HTTP 405). */
export class MethodNotAllowedError extends BaseError {
  /**
   * Constructs a new MethodNotAllowedError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Method not allowed.', HttpStatusCode.MethodNotAllowed, details, error);
  }
}

/** Error class for Conflict errors (HTTP 409). */
export class ConflictError extends BaseError {
  /**
   * Constructs a new ConflictError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Conflict.', HttpStatusCode.Conflict, details, error);
  }
}

/** Error class for Not Implemented errors (HTTP 501). */
export class NotImplementedError extends BaseError {
  /**
   * Constructs a new NotImplementedError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Not implemented.', HttpStatusCode.NotImplemented, details, error);
  }
}

/** Error class for Bad Gateway errors (HTTP 502). */
export class BadGatewayError extends BaseError {
  /**
   * Constructs a new BadGatewayError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Bad gateway.', HttpStatusCode.BadGateway, details, error);
  }
}

/** Error class for Service Unavailable errors (HTTP 503). */
export class ServiceUnavailableError extends BaseError {
  /**
   * Constructs a new ServiceUnavailableError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Service unavailable.', HttpStatusCode.ServiceUnavailable, details, error);
  }
}

/** Error class for Internal Server errors (HTTP 500). */
export class InternalServerError extends BaseError {
  /**
   * Constructs a new InternalServerError instance.
   *
   * @param {string} [details] - Optional details about the error.
   * @param {Error} [error] - Optional underlying error.
   */
  constructor(details?: string, error?: Error) {
    super('Internal server error.', HttpStatusCode.InternalServerError, details, error);
  }
}
