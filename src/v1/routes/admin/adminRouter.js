import express from "express";
const adminRouter = express.Router();
import AdminController from "./adminController.js";
import AdminValidator from "./adminValidator.js";

adminRouter
  .route("/publish-news/:action/:newsId")
  .get(AdminController.validationParams(AdminValidator.paramsPublishNews()), AdminController.publishNews);

adminRouter
  .route("/verify-otac-news/:action/:newsId")
  .post(
    AdminController.validationParams(AdminValidator.paramsPublishNews()),
    AdminController.validationBody(AdminValidator.bodyVerifyOTAC()),
    AdminController.verifyOTAC
  );

adminRouter
  .route("/resend-otac-news/:action/:newsId")
  .get(AdminController.validationParams(AdminValidator.paramsPublishNews()), AdminController.resendOTAC);

export default adminRouter;
