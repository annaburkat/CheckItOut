class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail';
    //all errors in this class will be operational errors
    this.isOperational = true;

    Error.captureStackTrace(this, this.construct);
  }
}

module.exports = AppError;