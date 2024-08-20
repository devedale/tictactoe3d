import authMiddleware from '../middlewares/jwtAuth';
import UserService from '../services/user';
import { Express } from 'express';

/**
 * Sets up routes for the users API in the Express application.
 *
 * @param {Express} app - The Express application instance.
 * @returns {void}
 */
export default (app: Express): void => {
  // Create an instance of the UserService
  const userService = new UserService();

  // Base URL for user-related routes
  const base_url = `${process.env.API_VERSION || '/api'}/users`;

  /**
   * Route to register a new user.
   *
   * @route POST /users/register
   * @handler userService.registerUser - Handler to register a new user.
   */
  app.post(`${base_url}/register`, userService.registerUser);

  /**
   * Route to log in a user.
   *
   * @route POST /users/login
   * @handler userService.loginUser - Handler to log in a user.
   */
  app.post(`${base_url}/login`, userService.loginUser);

  /**
   * Route to refill user information.
   *
   * @route POST /users/:id/refill
   * @middleware authMiddleware - Middleware to authenticate requests.
   * @handler userService.refillUser - Handler to refill information for a specific user.
   */
  app.post(`${base_url}/:id/recharge`, authMiddleware, userService.rechargeUser);

  /**
   * Route to get all users.
   *
   * @route GET /users
   * @middleware authMiddleware - Middleware to authenticate requests.
   * @handler userService.getUsers - Handler to retrieve all users.
   */
  app.get(`${base_url}`, authMiddleware, userService.getUsers);
};
