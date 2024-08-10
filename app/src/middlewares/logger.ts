import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  const userData = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    userAgent: req.get('User-Agent'),
    referrer: req.get('Referrer'),
  };

  // Map the rows of the object to highlight the logger messages
  const logData = (data: object, msg: string): void => {
    console.log(
      '\n' +
        JSON.stringify(data, null, 2)
          .split('\n')
          .map((line) => msg + line)
          .join('\n') +
        '\n'
    );
  };

  console.log(`LOGGER: [${new Date().toISOString()}] ${req.method} ${req.path}`);
  logData(userData, '#LOGGER REQUEST#: User data: ');
  logData(req.body, '#LOGGER REQUEST#: Request body: ');
  //Save original send method
  const originalSend = res.send;
  //Override res.send method to log response data
  res.send = function (body) {
    logData(res.getHeaders(), '#LOGGER RESPONSE#: Response headers: ');
    
    // Check body type in order to have proper logging
    if (typeof body === 'object') {
      logData(body, '#LOGGER RESPONSE#: Response data: ');
    } else {
      console.log(`#LOGGER RESPONSE#: Response data: ${body}`);
    }
    //Call original send with body in proper context
    return originalSend.call(this, body);
  };

  next();
};
