import express from "express";
const newsRouter = express.Router();
import NewsController from "./newsController.js";
import NewsValidator from "./newsValidator.js";
import { upload } from "../../utils/multer.js";
import { isLoggined, ChecksLogin, isAdmin } from "../../middleware/auth.js";

newsRouter
  .route("/")
  .post(
    isLoggined,
    isAdmin,
    upload.single("cover"),
    NewsController.validationBody(NewsValidator.bodyCreateNews()),
    NewsController.createNews
  );

newsRouter.route("/").get(ChecksLogin, NewsController.getAllNews);

newsRouter
  .route("/:id")
  .get(
    ChecksLogin,
    NewsController.validationParams(NewsValidator.paramsCheckId()),
    NewsController.getNewsById
  );

newsRouter
  .route("/:id")
  .put(
    isLoggined,
    isAdmin,
    NewsController.validationParams(NewsValidator.paramsCheckId()),
    NewsController.validationBody(NewsValidator.bodyUpdateNewsById()),
    NewsController.updateNewsById
  )
  .delete(
    isLoggined,
    isAdmin,
    NewsController.validationParams(NewsValidator.paramsCheckId()),
    NewsController.deleteNewsById
  );

newsRouter
  .route("/cover/update/:newsId")
  .patch(
    isLoggined,
    isAdmin,
    upload.single("cover"),
    NewsController.validationParams(NewsValidator.paramsCheckNewsId()),
    NewsController.updateCover
  );

export default newsRouter;
