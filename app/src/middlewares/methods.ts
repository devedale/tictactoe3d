import { Request, Response, NextFunction } from 'express';
import { ISError } from '../errors/ErrorFactory';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import { ErrorFactory } from '../errors/ErrorFactory';

/**
 * Middleware function to add custom methods to `req` and `res`.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function to pass control to the next middleware.
 * @returns {void}
 */
export default (req: Request, res: Response, next: NextFunction): void => {
  /**
   * Validates request body against allowed keys.
   *
   * @param {string[]} validKeys - Array of allowed keys in the request body.
   * @returns {void}
   */
  req.validateBody = (validKeys: string[]) => {
    const keys = Object.keys(req.body);

    for (const key of keys) {
      if (!validKeys.includes(key)) {
        return res.build('BadRequest', `Invalid key in request body: ${key}`);
      }
    }
  };

  /**
   * Validates request query parameters against allowed keys.
   *
   * @param {string[]} validKeys - Array of allowed keys in the query parameters.
   * @returns {void}
   */
  req.validateQuery = (validKeys: string[]) => {
    const keys = Object.keys(req.query);

    const invalidKeys = keys.reduce((acc: string[], key: string) => {
      if (!validKeys.includes(key)) {
        acc.push(key);
      }
      return acc;
    }, []);

    if (invalidKeys.length > 0) {
      return res.build('BadRequest', `Invalid key(s) in request query: ${invalidKeys.join(', ')}`);
    }
  };

  /**
   * Builds a response with error or success status.
   *
   * @template T - Type of the results in the success response.
   * @param {string} errorType - The type of error or success status.
   * @param {string} message - The message to include in the response.
   * @param {T} [results] - Optional results to include in the success response.
   * @returns {void}
   */
  res.build = <T>(errorType: string, message: string, results?: T) => {
    try {
      const error = ErrorFactory.getError(errorType);
      if (error) {
        error.setDetails(message);
        res.status(HttpStatusCode[errorType]).json(error);
      } else if (errorType === 'OK' || errorType === 'Created') {
        res.status(HttpStatusCode[errorType]).json({
          success: true,
          message: message,
          results: results,
        });
      } else {
        res.status(HttpStatusCode.InternalServerError).json({
          success: false,
          message: 'Unknown error type',
          details: message,
        });
      }
    } catch (err) {
      next(ISError('Error building response', err));
    }
  };

  /**
   * Sends a file with appropriate content type and attachment header.
   *
   * @param {Buffer} fileBuffer - The buffer of the file to send.
   * @param {string} format - The format of the file ('pdf', 'csv', or 'json').
   * @returns {void}
   */
  res.sendFile = (fileBuffer: Buffer, format: string) => {
    try {
      const contentType = format === 'pdf' ? 'application/pdf' : format === 'csv' ? 'text/csv' : 'application/json';
      const fileExtension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'json';

      res.setHeader('Content-Disposition', `attachment; filename=export.${fileExtension}`);
      res.setHeader('Content-Type', contentType);
      res.send(fileBuffer);
    } catch (err) {
      next(ISError('Error sending file', err));
    }
  };

  // Pass control to the next middleware
  next();
};
