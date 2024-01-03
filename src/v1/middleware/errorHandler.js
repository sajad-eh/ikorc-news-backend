import winston from "winston";
import Debug from "debug";
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

export default function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  debug(error);
  debug(err);

  winston.error(error.message, error);

  if (process.env.NODE_ENV === "development") {
    devError(res, error);
  } else if (process.env.NODE_ENV === "production") {
    prodError(res, error);
  }
}
