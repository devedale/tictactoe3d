import * as Errors from './AppError';
import { HttpStatusCode } from './HttpStatusCode';
import { Logger } from '../middlewares/logger';

/** Factory class for creating custom errors based on HTTP status codes. */
export class ErrorFactory {
  /**
   * Retrieves an error instance based on the provided HTTP status code type.
   *
   * @param {string} type - The HTTP status code type (as a string).
   * @returns {Errors.ErrorMsg | null} An instance of the corresponding error class, or null if the type is not recognized.
   */
  static getError(type: string): Errors.ErrorMsg | null {
    switch (HttpStatusCode[type]) {
      case HttpStatusCode.BadRequest:
        return new Errors.BadRequestError();
      case HttpStatusCode.Unauthorized:
        return new Errors.UnauthorizedError();
      case HttpStatusCode.Forbidden:
        return new Errors.ForbiddenError();
      case HttpStatusCode.NotFound:
        return new Errors.NotFoundError();
      case HttpStatusCode.MethodNotAllowed:
        return new Errors.MethodNotAllowedError();
      case HttpStatusCode.Conflict:
        return new Errors.ConflictError();
      case HttpStatusCode.InternalServerError:
        return new Errors.InternalServerError();
      case HttpStatusCode.NotImplemented:
        return new Errors.NotImplementedError();
      case HttpStatusCode.BadGateway:
        return new Errors.BadGatewayError();
      case HttpStatusCode.ServiceUnavailable:
        return new Errors.ServiceUnavailableError();
      default:
        return null;
    }
  }

  /**
   * Creates an InternalServerError with additional details and an underlying error.
   *
   * @param {string} details - A description of the additional error details.
   * @param {Error} error - The underlying error to include.
   * @returns {Errors.ErrorMsg} An instance of InternalServerError with the provided details and underlying error.
   */
  static ISError(details: string, error: Error): Errors.ErrorMsg {
    Logger.logStack(`Internal Server Error LOG: ${details}`, error);
    return new Errors.InternalServerError().setDetails(details).setErrorDetail(error);
  }
}
