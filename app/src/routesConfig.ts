import { Express } from 'express';
import user from './routes/user';
import game from './routes/game';

export const routesConfig = async (app: Express) => {
  user(app);
  game(app);
};

export default routesConfig;
