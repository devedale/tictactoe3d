import { ErrorMsg } from '../errors/AppError';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import { Request, Response, NextFunction } from 'express';

/**
 * Express error handling middleware to log and respond with errors.
 *
 * @param {ErrorMsg} error - The error object implementing the ErrorMsg interface.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function for passing control to the next middleware.
 */
export default (error: ErrorMsg, req: Request, res: Response, next: NextFunction) => {
  // Log the error details, including stack trace, to the request logger
  req.logError(`\n#START LOG ERROR#\n\n${error.error}\n\n#END LOG ERROR#\n`, error);

  // Remove the error property from the error object to avoid exposing sensitive information
  delete error.error;

  // Respond with a generic Internal Server Error status and the error details in JSON format
  res.status(HttpStatusCode.InternalServerError).json(error);
};
