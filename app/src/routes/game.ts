import authMiddleware from '../middlewares/jwtAuth';
import GameService from '../services/game';
import { Express } from 'express';

/**
 * Sets up routes for the games API in the Express application.
 *
 * @param {Express} app - The Express application instance.
 * @returns {void}
 */
export default (app: Express): void => {
  // Create an instance of the GameService
  const gameService = new GameService();

  // Base URL for game-related routes
  const base_url = `${process.env.API_VERSION || '/api'}/games`;

  /**
   * Route to create a new game.
   *
   * @route POST /games
   * @middleware authMiddleware - Middleware to authenticate requests.
   * @handler gameService.createGame - Handler to create a new game.
   */
  app.post(`${base_url}`, authMiddleware, gameService.createGame);

  /**
   * Route to get all games.
   *
   * @route GET /games
   * @middleware authMiddleware - Middleware to authenticate requests.
   * @handler gameService.getGames - Handler to retrieve all games.
   */
  app.get(`${base_url}`, authMiddleware, gameService.getGames);

  /**
   * Route to get the ranking list of games.
   *
   * @route GET /games/rankList
   * @handler gameService.rankList - Handler to retrieve the ranking list of games.
   */
  app.get(`${base_url}/rankList`, gameService.rankList);

  /**
   * Route to resign from a game.
   *
   * @route PATCH /games/:id/resign
   * @middleware authMiddleware - Middleware to authenticate requests.
   * @handler gameService.resignGame - Handler to resign from a specific game.
   */
  app.patch(`${base_url}/:id/resign`, authMiddleware, gameService.resignGame);

  /**
   * Route to get the move history of a game.
   *
   * @route GET /games/:id/history
   * @middleware authMiddleware - Middleware to authenticate requests.
   * @handler gameService.gameMoveHistory - Handler to retrieve the move history of a specific game.
   */
  app.get(`${base_url}/:id/history`, authMiddleware, gameService.gameMoveHistory);

  /**
   * Route to get the status of a game.
   *
   * @route GET /games/:id
   * @middleware authMiddleware - Middleware to authenticate requests.
   * @handler gameService.gameStatus - Handler to retrieve the status of a specific game.
   */
  app.get(`${base_url}/:id`, authMiddleware, gameService.gameStatus);

  /**
   * Route to make a move in a game.
   *
   * @route PATCH /games/:id
   * @middleware authMiddleware - Middleware to authenticate requests.
   * @handler gameService.makeMove - Handler to make a move in a specific game.
   */
  app.patch(`${base_url}/:id`, authMiddleware, gameService.makeMove);
};
