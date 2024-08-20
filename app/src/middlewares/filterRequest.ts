import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check request method and custom headers.
 *
 * This middleware verifies that the request method is one of GET, POST, or PATCH. If the method is not one of these, it responds with a Forbidden
 * status. The custom header check is currently commented out.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function to pass control to the next middleware.
 * @returns {void}
 */
export default (req: Request, res: Response, next: NextFunction): void => {
  // Check if the request method is GET, POST, or PATCH
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {
    // Respond with a Forbidden status if the method is not allowed
    return res.build('Forbidden', 'Checking request format: Forbidden Request');
  }

  /*
  // Uncomment the following code to enable custom header validation

  const customHeader = req.headers['filter-header'];

  const expectedFilterHeader = process.env.EXPECTED_FILTER_HEADER || 'noFilterHeaderValue';

  // Check if the custom header is present
  if (!customHeader) {
    // Respond with a Bad Request status if the custom header is missing
    return res.build('BadRequest', 'Checking request format: Bad Request');
  }

  // Check if the custom header value matches the expected value
  if (customHeader !== expectedFilterHeader) {
    // Respond with an Unauthorized status if the header value does not match
    return res.build('Unauthorized', 'Checking request format: Unauthorized request');
  }

  */

  // Pass control to the next middleware if the request method is allowed
  next();
};
