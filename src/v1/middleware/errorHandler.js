import winston from "winston";
import Debug from "debug";
import ErrorResponse from "../utils/errorResponse.js";
const debug = Debug("app:err");

// Error handling for development mode.
const devError = (res, error) => {
  return res.status(error.statusCode || 500).json({
    status: error.status,
    message: error.message,
    data: error.data,
    stackTrace: error.stack,
    error: error,
  });
};

// Error handling for production mode.
const prodError = (res, error) => {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      data: error.data,
    });
  } else {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
      data: null,
    });
  }
};

// Error handling for image size and image format.
const limitFileSizeHandler = (err) => {
  if (err.code == "LIMIT_FILE_SIZE") {
    return new ErrorResponse(413, "The image size should not exceed 10 MB.");
  } else if (err.code == "error file type") {
    return new ErrorResponse(415, "Image format must be jpeg/jpg/png/webp");
  }
};

// Error handling.
export default function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  debug(error);
  debug(err);

  winston.error(error.message, error);

  if (process.env.NODE_ENV) {
    devError(res, error);
  } else if (process.env.NODE_ENV == "production") {
    if (error.name == "MulterError") error = limitFileSizeHandler(error);
    prodError(res, error);
  }
}
