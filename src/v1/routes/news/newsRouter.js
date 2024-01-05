import express from "express";
const newsRouter = express.Router();
import NewsController from "./newsController.js";
import NewsValidator from "./newsValidator.js";

newsRouter.post(
  "/",
  NewsController.validationBody(NewsValidator.bodyCreateNews()),
  NewsController.createNews
);

newsRouter.get("/", NewsController.getAllNews);

newsRouter.get(
  "/:id",
  NewsController.validationParams(NewsValidator.paramsCheckId()),
  NewsController.getNewsById
);

newsRouter.put(
  "/:id",
  NewsController.validationParams(NewsValidator.paramsCheckId()),
  NewsController.validationBody(NewsValidator.bodyUpdateNewsById()),
  NewsController.updateNewsById
);

newsRouter.delete(
  "/:id",
  NewsController.validationParams(NewsValidator.paramsCheckId()),
  NewsController.deleteNewsById
);

export default newsRouter;
