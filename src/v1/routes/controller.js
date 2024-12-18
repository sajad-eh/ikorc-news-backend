import autoBind from "auto-bind";
import url from "node:url";
import ErrorResponse from "../utils/errorResponse.js";
import News from "../models/news.js";
import User from "../models/user.js";
import UserAuthorization from "../models/userAuthorization.js";
import ForgetPassword from "../models/forgetPassword.js";
import NewsAuthorization from "../models/newsAuthorization.js";
import Category from "../models/category.js";
class Controller {
  constructor() {
    autoBind(this);
    this.ErrorResponse = ErrorResponse;
    this.News = News;
    this.User = User;
    this.UserAuthorization = UserAuthorization;
    this.ForgetPassword = ForgetPassword;
    this.NewsAuthorization = NewsAuthorization;
    this.Category = Category;
  }

  // Controls validation params errors for show.
  validationParams = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      const messages = [];
      error.details.forEach((err) => messages.push(err.message));
      next(new ErrorResponse(400, messages));
    }
    next();
  };

  // Controls validation body errors for show.
  validationBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = [];
      error.details.forEach((err) => messages.push(err.message));
      next(new ErrorResponse(400, messages));
    }
    next();
  };

  // Controller structure that handles confirmation responses for show.
  response({ res, status = "ok", message, statusCode = 200, data = null }) {
    res.status(statusCode).json({
      status,
      message,
      data,
    }).end;
  }

  returnBaseUrl(req) {
    return url.format({
      protocol: req.protocol,
      host: req.get("host"),
    });
  }
}

export { Controller };
