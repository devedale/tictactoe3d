import authMiddleware from '../middlewares/jwtAuth';
import UserService from '../services/user';
import { Express } from 'express';

export default (app: Express) => {
  const userService = new UserService();
  const base_url = `${process.env.API_VERSION || '/api'}/users`;
  app.post(`${base_url}/register`, userService.registerUser);
  app.post(`${base_url}/login`, userService.loginUser);
  app.post(`${base_url}/:id/refill`, authMiddleware, userService.refillUser);
  app.get(`${base_url}`, authMiddleware, userService.getUsers);
};
