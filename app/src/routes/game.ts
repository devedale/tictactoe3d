import authMiddleware from '../middlewares/jwtAuth';
import GameService from '../services/game';
import { Express } from 'express';

export default (app: Express) => {
  const gameService = new GameService();
  const base_url = `${process.env.API_VERSION || '/api'}/games`;
  app.post(`${base_url}`, authMiddleware, gameService.createGame);
  app.get(`${base_url}`, authMiddleware, gameService.getGames);
};
