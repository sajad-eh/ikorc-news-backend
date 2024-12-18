import express from "express";
const categoryRouter = express.Router();
import CategoryController from "./categoryController.js";
import CategoryValidator from "./categoryValidator.js";
import { isLoggined, isAdmin } from "../../middleware/auth.js";

categoryRouter
  .route("/")
  .post(
    isLoggined,
    isAdmin,
    CategoryController.validationBody(CategoryValidator.bodyCreateCategory()),
    CategoryController.createCategory
  );

categoryRouter.route("/").get(CategoryController.getAllCategory);

categoryRouter
  .route("/:id")
  .put(
    isLoggined,
    isAdmin,
    CategoryController.validationParams(CategoryValidator.paramsCheckId()),
    CategoryController.validationBody(CategoryValidator.bodyUpdateCategoryById()),
    CategoryController.updateCategoryById
  );

categoryRouter
  .route("/:id")
  .delete(
    isLoggined,
    isAdmin,
    CategoryController.validationParams(CategoryValidator.paramsCheckId()),
    CategoryController.deleteCategoryById
  );

export default categoryRouter;
