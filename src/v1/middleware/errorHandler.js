import winston from "winston";
import Debug from "debug";
import ErrorResponse from "../utils/errorResponse.js";
const debug = Debug("app:err");

const devError = (res, error) => {
  return res.status(error.statusCode || 500).json({
    status: error.status,
    message: error.message,
    data: null,
    stackTrace: error.stack,
    error: error,
  });
};

const prodError = (res, error) => {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      data: null,
    });
  } else {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
      data: null,
    });
  }
};

const limitFileSizeHandler = (err) => {
  if (err.code == "LIMIT_FILE_SIZE") {
    return new ErrorResponse(413, "حجم تصویر نباید بیشتر از 10 مگابایت باشد");
  } else if (err.code == "error file type") {
    return new ErrorResponse(415, "فرمت تصویر باید jpeg/jpg/png/webp باشد");
  }
};

export default function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  debug(error);
  debug(err);

  winston.error(error.message, error);

  if (process.env.NODE_ENV == "development") {
    devError(res, error);
  } else if (process.env.NODE_ENV == "production") {
    if (error.name == "MulterError") error = limitFileSizeHandler(error);
    prodError(res, error);
  }
}
