import express from "express";
const adminRouter = express.Router();
import AdminController from "./adminController.js";
import AdminValidator from "./adminValidator.js";

adminRouter
  .route("/news/publish/:action/:newsId")
  .get(AdminController.validationParams(AdminValidator.paramsPublishNews()), AdminController.publishNews);

adminRouter
  .route("/news/verify/otac/:action/:newsId")
  .post(
    AdminController.validationParams(AdminValidator.paramsPublishNews()),
    AdminController.validationBody(AdminValidator.bodyVerifyOTAC()),
    AdminController.verifyOTAC
  );

adminRouter
  .route("/news/resend/otac/:action/:newsId")
  .get(AdminController.validationParams(AdminValidator.paramsPublishNews()), AdminController.resendOTAC);

export default adminRouter;
