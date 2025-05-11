export class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
      super(message);
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.isOperational = true;
      
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export const handleError = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log error
    console.error('ERROR 💥', err);
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Invalid ${err.path}: ${err.value}`;
      error = new AppError(message, 400, 'INVALID_ID');
    }
    
    // Mongoose duplicate key
    if (err.code === 11000) {
      const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
      const message = `Duplicate field value: ${value}. Please use another value`;
      error = new AppError(message, 400, 'DUPLICATE_VALUE');
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      const message = `Invalid input data. ${errors.join('. ')}`;
      error = new AppError(message, 400, 'VALIDATION_ERROR');
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again', 401, 'INVALID_TOKEN');
    }
    
    if (err.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired. Please log in again', 401, 'EXPIRED_TOKEN');
    }
    
    // Send response
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        errorCode: error.errorCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    } else {
      // Unknown error
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
        errorCode: 'SERVER_ERROR'
      });
    }
  };
  