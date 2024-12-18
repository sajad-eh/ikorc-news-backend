import express from "express";
const userRouter = express.Router();
import UserController from "./userController.js";
import UserValidator from "./userValidator.js";

userRouter.route("/dashboard").get(UserController.dashboard);

userRouter
  .route("/update-user")
  .patch(UserController.validationBody(UserValidator.bodyUpdateUser()), UserController.updateUser);

userRouter
  .route("/update-password")
  .patch(UserController.validationBody(UserValidator.bodyUpdatePassword()), UserController.updatePassword);

export default userRouter;
