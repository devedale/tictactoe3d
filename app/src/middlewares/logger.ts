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

  const logData = (data: object, msg: string): void => {
    console.log(
      '\n' +
        JSON.stringify(userData, null, 2)
          .split('\n')
          .map((line) => msg + line)
          .join('\n') +
        '\n'
    );
  };

  logData(userData, '#LOGGER REQUEST#: User data: ');
  logData(req.body, '#LOGGER REQUEST#: Request body: ');

  const oldSend = res.send;
  res.send = function (data) {
    logData(res.getHeaders(), '#LOGGER RESPONSE#: Response headers: ');
    logData(data, '#LOGGER RESPONSE#: Response data: ');

    return oldSend.bind(this, data)();
  };

  next();
};
