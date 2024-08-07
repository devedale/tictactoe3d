import { Request, Response, NextFunction } from 'express';
import { ISError } from '../errors/ErrorFactory';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import { ErrorFactory } from '../errors/ErrorFactory';

export default (req: Request, res: Response, next: NextFunction) => {
  req.validate = (validKeys: string[]) => {
    const keys = Object.keys(req.body);

    for (const key of keys) {
      if (!validKeys.includes(key)) {
        return res.build('BadRequest', `Invalid key in request body: ${key}`);
      }
    }
  };

  res.build = <T>(errorType: string, message: string, results?: T) => {
    try {
      const error = ErrorFactory.getError(errorType);
      if (error) {
        error.setDetails(message);
        res.status(HttpStatusCode[errorType]).json(error);
      } else if (errorType == 'OK' || errorType == 'Created') {
        res.status(HttpStatusCode[errorType]).json({
          success: true,
          message: message,
          results: results,
        });
      } else {
        res.status(HttpStatusCode.InternalServerError).json({
          success: false,
          message: 'Unknown error type',
          details: message,
        });
      }
    } catch (err) {
      next(ISError('Error building response', err));
    }
  };

  res.sendFile = (fileBuffer, format: string) => {
    try {
      const contentType = format === 'pdf' ? 'application/pdf' : format === 'csv' ? 'text/csv' : 'application/json';
      const fileExtension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'json';

      res.setHeader('Content-Disposition', `attachment; filename=export.${fileExtension}`);
      res.setHeader('Content-Type', contentType);
      res.send(fileBuffer);
    } catch (err) {
      next(ISError('Error sending file', err));
    }
  };
  next();
};
