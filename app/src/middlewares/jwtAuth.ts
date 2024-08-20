import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

/**
 * Middleware for authenticating requests using JWT with RSA public key.
 *
 * This middleware extracts the JWT from the Authorization header, verifies it using an RSA public key, and attaches the decoded token information to
 * the request object. If the token is not present or invalid, it responds with an appropriate status.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function to pass control to the next middleware.
 * @returns {void}
 */
const authRSAMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Extract the JWT from the Authorization header
  const token = req.headers.authorization?.split(' ')[1];

  // Check if the token is present
  if (!token) {
    return res.build('Unauthorized', "La richiesta non ha il token nell'header.");
  }

  try {
    // Read the RSA public key from the file system
    const public_key = await fs.promises.readFile('./src/middlewares/jwtRS256.key.pub');

    // Verify the JWT using the RSA public key
    const decoded = jwt.verify(token, public_key, { algorithms: ['RS256'] });

    // Attach decoded token information to the request object
    req['decodedToken'] = decoded;
    req['userId'] = decoded.userId;
    req['userEmail'] = decoded.email;

    console.log('\ndecoded', decoded, '\n');

    // Pass control to the next middleware
    next();
  } catch (err) {
    // Log the error and respond with Forbidden status if the token is invalid
    console.log(err);
    return res.build('Forbidden', 'Il token non è valido.');
  }
};

export default authRSAMiddleware;
