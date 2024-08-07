import { Express } from 'express';
import user from './routes/user';

export const routesConfig = async (app: Express) => {
  user(app);
};

export default routesConfig;
