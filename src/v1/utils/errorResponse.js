export default class ErrorResponse extends Error {
  constructor(statusCode, message, data) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.data = data || null;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
