import { Express } from 'express';
import user from './routes/user';
import game from './routes/game';

/**
 * Configures the routes for the Express application.
 *
 * @param {Express} app - The Express application instance.
 *
 *   This function sets up the routing for the application by importing and applying the routes defined in the `user` and `game` route modules.
 */
export const routesConfig = async (app: Express) => {
  // Apply user-related routes to the application
  user(app);

  // Apply game-related routes to the application
  game(app);
};

export default routesConfig;
