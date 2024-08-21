import { Request, Response, NextFunction } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

// define file log path
const LOG_FILE_PATH = path.join(__dirname, '../logs', 'app.log');
const MAX_LOG_FILE_SIZE = process.env.MAX_LOG_FILE_SIZE * 1024 * 1024;

/**
 * Logger class provides static methods to log various types of messages including information, errors, and warnings. It also has methods to log
 * request and response details.
 */
class Logger {
  /**
   * Appends a log message to the log file.
   *
   * @private
   * @param {string} message - The log message to be written to the file.
   * @returns {Promise<void>} - A promise that resolves when the log operation is complete.
   */
  private static async writeLogToFile(message: string): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      const logDir = path.dirname(LOG_FILE_PATH);

      try {
        await fs.access(logDir);
      } catch {
        await fs.mkdir(logDir, { recursive: true });
      }

      try {
        const fileStats = await fs.stat(LOG_FILE_PATH);
        const maxFileSize = MAX_LOG_FILE_SIZE * 1024 * 1024; // Set your max file size limit here (e.g., 5 MB)

        if (fileStats.size >= maxFileSize) {
          const warningMessage = 'Log file size exceeds the maximum limit. Logging is paused.';
          await Logger.logWarning(warningMessage, { filePath: LOG_FILE_PATH, fileSize: fileStats.size });
          return;
        }
      } catch (error) {
        // Handle the case where the log file does not exist yet
        if (error.code !== 'ENOENT') {
          throw error; // If it's not a 'file not found' error, rethrow it
        }
      }

      await fs.appendFile(LOG_FILE_PATH, `${new Date().toISOString()} - ${message}\n`, 'utf8');
    }
  }

  /**
   * Logs informational messages to the console and file.
   *
   * @param {string} message - The informational message to log.
   * @param {any} [data] - Optional data to include in the log.ss
   */
  static async logInfo(message: string, data?: any) {
    const logMessage = `\n#LOGGER INFO#: ${message}\n${data ? JSON.stringify(data, null, 2) : ''}\n`;
    console.log(logMessage);
    await Logger.writeLogToFile(logMessage);
  }

  /**
   * Logs error messages to the console and file.
   *
   * @param {string} message - The error message to log.
   * @param {any} error - The error object to include in the log.
   */
  static async logError(message: string, error: any) {
    const logMessage = `\n#LOGGER ERROR#: ${message}\n${JSON.stringify(error, null, 2)}\n${error.stack}\n`;
    console.error(logMessage);
    await Logger.writeLogToFile(logMessage);
  }

  /**
   * Logs error stack traces to the console and file.
   *
   * @param {string} message - The error message to log.
   * @param {any} error - The error object to include in the log.
   */
  static async logStack(message: string, error: any) {
    const logMessage = `\n#LOGGER ERROR STACK#: ${message}\n${error.stack}\n`;
    console.error(logMessage);
    await Logger.writeLogToFile(logMessage);
  }

  /**
   * Logs warning messages to the console and file.
   *
   * @param {string} message - The warning message to log.
   * @param {any} warning - The warning object to include in the log.
   */
  static async logWarning(message: string, warning: any) {
    const logMessage = `\n#LOGGER WARNING#: ${message}\n${JSON.stringify(warning, null, 2)}\n`;
    console.warn(logMessage);
    await Logger.writeLogToFile(logMessage);
  }

  /**
   * Helper function to format and log data with a message prefix to console and file.
   *
   * @private
   * @param {object} data - The data to format and log.
   * @param {string} msg - The message prefix for each line of the data.
   */
  private static async logData(data: object, msg: string): Promise<void> {
    const formattedData =
      '\n' +
      JSON.stringify(data, null, 2)
        .split('\n')
        .map((line) => msg + line)
        .join('\n') +
      '\n';
    console.log(formattedData);
    await Logger.writeLogToFile(formattedData);
  }

  /**
   * Logs request details including method, URL, headers, and body to console and file.
   *
   * @param {Request} req - The Express request object to log.
   */
  static async logRequest(req: Request) {
    const userData = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
    };

    const logMessage = `LOGGER: [${new Date().toISOString()}] ${req.method} ${req.path}\n`;
    console.log(logMessage);
    await Logger.writeLogToFile(logMessage);

    await Logger.logData(userData, '#LOGGER REQUEST#: User data: ');
    await Logger.logData(req.body, '#LOGGER REQUEST#: Request body: ');
  }

  /**
   * Logs response details including headers and body to console and file.
   *
   * @param {Response} res - The Express response object to log.
   * @param {any} body - The response body to log.
   */
  static async logResponse(res: Response, body: any) {
    await Logger.logData(res.getHeaders(), '#LOGGER RESPONSE#: Response headers: ');

    const logMessage =
      typeof body === 'object'
        ? `#LOGGER RESPONSE#: Response data: ${JSON.stringify(body, null, 2)}\n`
        : `#LOGGER RESPONSE#: Response data: ${body}\n`;
    console.log(logMessage);
    await Logger.writeLogToFile(logMessage);
  }
}

/**
 * Middleware function to add logging methods to the request and override the response `send` method to log response data.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function to pass control to the next middleware.
 * @returns {void}
 */
export default (req: Request, res: Response, next: NextFunction): void => {
  // Add logging methods to the request object
  req.logInfo = async (message: string, data?: any) => {
    await Logger.logInfo(message, data);
  };

  req.logError = async (message: string, error: any) => {
    await Logger.logError(message, error);
  };

  req.logWarning = async (message: string, warning: any) => {
    await Logger.logWarning(message, warning);
  };

  // Log the request details
  Logger.logRequest(req).catch(console.error);

  // Save the original send method
  const originalSend = res.send;

  // Override res.send method to log response data
  res.send = function (body) {
    // Log the response
    Logger.logResponse(res, body).catch(console.error);

    // Call the original send method with body in proper context
    return originalSend.call(this, body);
  };

  // Pass control to the next middleware
  next();
};

export { Logger };
