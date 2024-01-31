import express from "express";
const authRouter = express.Router();
import AuthController from "./authController.js";
import AuthValidator from "./authValidator.js";

authRouter
  .route("/register")
  .post(AuthController.validationBody(AuthValidator.bodyRegisterValidator()), AuthController.register);

authRouter
  .route("/verifyOTP/:userId")
  .post(
    AuthController.validationParams(AuthValidator.paramsCheckId()),
    AuthController.validationBody(AuthValidator.bodyVerifyOTP()),
    AuthController.verifyOtp
  );

authRouter
  .route("/resendOTPCode/:userId")
  .get(AuthController.validationParams(AuthValidator.paramsCheckId()), AuthController.resendOTPCode);

authRouter
  .route("/login")
  .post(AuthController.validationBody(AuthValidator.bodyLoginValidator()), AuthController.login);

authRouter.route("/logout").get(AuthController.logout);

authRouter
  .route("/forgetPassword")
  .post(AuthController.validationBody(AuthValidator.bodyForgetPassword()), AuthController.forgetPassword);

authRouter
  .route("/resetPassword/:token")
  .patch(
    AuthController.validationParams(AuthValidator.paramsCheckToken()),
    AuthController.validationBody(AuthValidator.bodyResetPassword()),
    AuthController.resetPassword
  );

export default authRouter;
