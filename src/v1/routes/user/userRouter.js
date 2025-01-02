import express from "express";
const userRouter = express.Router();
import UserController from "./userController.js";
import UserValidator from "./userValidator.js";

userRouter.route("/me").get(UserController.me);

userRouter
  .route("/update")
  .patch(UserController.validationBody(UserValidator.bodyUpdateUser()), UserController.updateUser);

userRouter
  .route("/password/update")
  .patch(UserController.validationBody(UserValidator.bodyUpdatePassword()), UserController.updatePassword);

export default userRouter;
