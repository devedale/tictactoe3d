import { Request, Response, NextFunction } from 'express';

class Logger {
  static logInfo(message: string, data?: any) {
    console.log(`\n# LOGGER INFO # : ${message}\n`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  static logError(message: string, error: any) {
    console.error(`\nX LOGGER ERROR X : ${message}\n`);
    console.error(JSON.stringify(error, null, 2));
  }

  static logWarning(message: string, warning: any) {
    console.warn(`\n! LOGGER WARNING ! : ${message}\n`);
    console.warn(JSON.stringify(warning, null, 2));
  }

  // Helper function to format log data
  private static logData(data: object, msg: string): void {
    console.log(
      '\n' +
        JSON.stringify(data, null, 2)
          .split('\n')
          .map((line) => msg + line)
          .join('\n') +
        '\n'
    );
  }

  static logRequest(req: Request) {
    const userData = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
    };

    console.log(`LOGGER: [${new Date().toISOString()}] ${req.method} ${req.path}`);
    Logger.logData(userData, '#LOGGER REQUEST#: User data: ');
    Logger.logData(req.body, '#LOGGER REQUEST#: Request body: ');
  }

  static logResponse(res: Response, body: any) {
    Logger.logData(res.getHeaders(), '#LOGGER RESPONSE#: Response headers: ');

    // Check body type in order to have proper logging
    if (typeof body === 'object') {
      Logger.logData(body, '#LOGGER RESPONSE#: Response data: ');
    } else {
      console.log(`#LOGGER RESPONSE#: Response data: ${body}`);
    }
  }
}

export default (req: Request, res: Response, next: NextFunction) => {
  // Add methods
  req.logInfo = (message: string, data?: any) => {
    Logger.logInfo(message, data);
  };

  req.logError = (message: string, error: any) => {
    Logger.logError(message, error);
  };

  req.logWarning = (message: string, warning: any) => {
    Logger.logWarning(message, warning);
  };

  Logger.logRequest(req);

  // Save original send method
  const originalSend = res.send;

  // Override res.send method to log response data
  res.send = function (body) {
    // Log the response
    Logger.logResponse(res, body);

    // Call original send with body in proper context
    return originalSend.call(this, body);
  };

  next();
};