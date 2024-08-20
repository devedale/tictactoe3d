import express from 'express';
import loggerMiddleware from './middlewares/logger';
import methodsMiddleware from './middlewares/methods';
import filterRequestMiddleware from './middlewares/filterRequest';
import errorHandler from './middlewares/errorHandler';
import routesConfig from './routesConfig';

// Create an instance of the Express application
export const app = express();

// Middleware to parse JSON bodies in requests
app.use(express.json());

// Middleware to log details of incoming requests and responses, also define Logger class for logging purposes
app.use(loggerMiddleware);

// Middleware adding methods to request and response objects
app.use(methodsMiddleware);

// Middleware to filter and validate incoming requests methods (req.method)
app.use(filterRequestMiddleware);

// Configure routes for the application in file './routesConfig.ts'
routesConfig(app);

// Middleware to handle errors
app.use(errorHandler);

export default app;
