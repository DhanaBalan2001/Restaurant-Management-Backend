import Logger from '../utils/logger.js';

export const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms | IP: ${req.ip}`
    );
  });
  
  next();
};
