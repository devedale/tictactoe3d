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
  console.log(`LOGGER: [${new Date().toISOString()}] ${req.method} ${req.path}`);
  logData(userData, '#LOGGER REQUEST#: User data: ');
  logData(req.body, '#LOGGER REQUEST#: Request body: ');

  if(res.json){
    console.log("\n\nJSON\n\n");
    
    const oldRes = res.json;
    res.json = function (data) {

      logData(res.getHeaders(), '#LOGGER RESPONSE#: Response headers: ');
      logData(data, '#LOGGER RESPONSE#: Response data: ');
  
      return oldRes.call(this, data);
    };
  } else if (res.send) {
    console.log("\n\nSEND\n\n");

    const oldRes = res.send;
    res.send = function (data) {
      // Log response data for send
      try {
        const jsonData = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
        logData(jsonData, '#LOGGER RESPONSE#: Response data: ');
      } catch (error) {
        console.error('#LOGGER RESPONSE#: Error serializing response data:', error);
      }
  
      return oldRes.call(this, data);
    };
  }




  next();
};
