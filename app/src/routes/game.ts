import authMiddleware from '../middlewares/jwtAuth';
import GameService  from '../services/game';
import { Express } from 'express';

export default (app: Express) => {
  const gameService = new GameService();

  const base_url = `${process.env.API_VERSION || '/api'}/games`;
  app.post(`${base_url}`, authMiddleware, gameService.createGame);
  app.get(`${base_url}`, authMiddleware, gameService.getGames);
  //app.get(`${base_url}/:id`, authMiddleware, gameService.getGameById);
  app.patch(`${base_url}/:id/resign`, authMiddleware, gameService.resignGame);
  app.get(`${base_url}/:id/history`, authMiddleware, gameService.gameMoveHistory);
  app.get(`${base_url}/:id`, authMiddleware, gameService.gameStatus);
  app.patch(`${base_url}/:id`, authMiddleware, gameService.makeMove);
  


};
