import express from 'express';
import methodsMiddleware from './middlewares/methods';
import loggerMiddleware from './middlewares/logger';

import routesConfig from './routesConfig';

export const app = express();

app.use(express.json());

app.use(loggerMiddleware);
app.use(methodsMiddleware);

routesConfig(app);

export default app;
