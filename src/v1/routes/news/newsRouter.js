import express from "express";
const newsRouter = express.Router();
import NewsController from "./newsController.js";
import NewsValidator from "./newsValidator.js";
import { upload } from "../../utils/multer.js";

newsRouter
  .route("/")
  .post(
    upload.single("cover"),
    NewsController.validationBody(NewsValidator.bodyCreateNews()),
    NewsController.createNews
  )
  .get(NewsController.getAllNews);

newsRouter
  .route("/:id")
  .get(NewsController.validationParams(NewsValidator.paramsCheckId()), NewsController.getNewsById)
  .put(
    NewsController.validationParams(NewsValidator.paramsCheckId()),
    NewsController.validationBody(NewsValidator.bodyUpdateNewsById()),
    NewsController.updateNewsById
  )
  .delete(NewsController.validationParams(NewsValidator.paramsCheckId()), NewsController.deleteNewsById);

export default newsRouter;
