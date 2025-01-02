import express from "express";
const authRouter = express.Router();
import AuthController from "./authController.js";
import AuthValidator from "./authValidator.js";

authRouter
  .route("/register")
  .post(AuthController.validationBody(AuthValidator.bodyRegisterValidator()), AuthController.register);

authRouter
  .route("/login")
  .post(AuthController.validationBody(AuthValidator.bodyLoginValidator()), AuthController.loginWithPassword);

authRouter.post(
  "/login/otac",
  AuthController.validationBody(AuthValidator.bodyLoginWithOTAC()),
  AuthController.loginWithOTAC
);

authRouter.route("/logout").get(AuthController.logout);

authRouter
  .route("/verify/otac/:userId")
  .post(
    AuthController.validationParams(AuthValidator.paramsCheckId()),
    AuthController.validationBody(AuthValidator.bodyVerifyOTAC()),
    AuthController.verifyOTAC
  );

authRouter
  .route("/user/verify/otac/:userId")
  .post(
    AuthController.validationParams(AuthValidator.paramsCheckId()),
    AuthController.validationBody(AuthValidator.bodyVerifyOTAC()),
    AuthController.verifyUserWithOTAC
  );

authRouter
  .route("/resend/otac/:userId")
  .get(AuthController.validationParams(AuthValidator.paramsCheckId()), AuthController.resendOTAC);

authRouter
  .route("/password/forget")
  .post(AuthController.validationBody(AuthValidator.bodyForgetPassword()), AuthController.forgetPassword);

authRouter
  .route("/password/reset/:token")
  .patch(
    AuthController.validationParams(AuthValidator.paramsCheckToken()),
    AuthController.validationBody(AuthValidator.bodyResetPassword()),
    AuthController.resetPassword
  );

export default authRouter;
