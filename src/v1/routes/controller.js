import autoBind from "auto-bind";
import url from "node:url";
import path from "path";
import ErrorResponse from "../utils/errorResponse.js";
import News from "../models/News.js";
class Controller {
  constructor() {
    autoBind(this);
    this.ErrorResponse = ErrorResponse;
    this.News = News;
  }

  validationParams = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      const messages = [];
      error.details.forEach((err) => messages.push(err.message));
      next(new ErrorResponse(400, messages));
    }
    next();
  };

  validationBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = [];
      error.details.forEach((err) => messages.push(err.message));
      next(new ErrorResponse(400, messages));
    }
    next();
  };

  response({ res, status = "ok", message, statusCode = 200, data = null }) {
    res.status(statusCode).json({
      status,
      message,
      data,
    }).end;
  }

  returnBaseUrl(req) {
    return = url.format({
      protocol: req.protocol,
      host: req.get("host"),
    });
  }
}

export { Controller };
