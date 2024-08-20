/** Enum representing standard HTTP status codes. */
export enum HttpStatusCode {
  /** 200 OK - The request has succeeded. */
  OK = 200,

  /** 201 Created - The request has succeeded and a new resource has been created. */
  Created = 201,

  /** 400 Bad Request - The server could not understand the request due to invalid syntax. */
  BadRequest = 400,

  /** 401 Unauthorized - The request requires user authentication. */
  Unauthorized = 401,

  /** 403 Forbidden - The server understood the request, but it refuses to authorize it. */
  Forbidden = 403,

  /** 404 Not Found - The server could not find the requested resource. */
  NotFound = 404,

  /** 405 Method Not Allowed - The request method is not supported for the requested resource. */
  MethodNotAllowed = 405,

  /** 409 Conflict - The request could not be processed because of conflict in the request. */
  Conflict = 409,

  /** 500 Internal Server Error - The server encountered an unexpected condition that prevented it from fulfilling the request. */
  InternalServerError = 500,

  /** 501 Not Implemented - The server does not support the functionality required to fulfill the request. */
  NotImplemented = 501,

  /** 502 Bad Gateway - The server received an invalid response from the upstream server it accessed while attempting to fulfill the request. */
  BadGateway = 502,

  /** 503 Service Unavailable - The server is currently unable to handle the request due to temporary overloading or maintenance of the server. */
  ServiceUnavailable = 503,
}
