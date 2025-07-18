import { Request, Response, NextFunction } from 'express';

export interface RequestWithTimer extends Request {
  startTime?: number;
}

/**
 * Middleware to track request duration and log slow requests
 */
export const requestTimeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: RequestWithTimer, res: Response, next: NextFunction) => {
    req.startTime = Date.now();

    // Set a timeout for the request
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`Request timeout after ${timeoutMs}ms:`, {
          method: req.method,
          url: req.url,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        });
        res.status(408).json({
          status: 'error',
          message: 'Request timeout',
          error: `Request took longer than ${timeoutMs}ms`,
        });
      }
    }, timeoutMs);

    // Clear timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timeout);
      const duration = Date.now() - (req.startTime || 0);

      // Log slow requests (over 1 second)
      if (duration > 1000) {
        console.warn(`Slow request detected:`, {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent'),
        });
      }

      // Log all requests in development
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
        );
      }
    });

    next();
  };
};

/**
 * Database operation timeout wrapper
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  operation: string = 'Database operation'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operation} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};
