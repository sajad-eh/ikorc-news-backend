import { Controller } from "../controller.js";
import _ from "lodash";
import Debug from "debug";
const debug = Debug("app:main");

export default new (class UserController extends Controller {
  async dashboard(req, res, next) {
    const user = await this.User.findById(req.session.user._id);

    this.response({
      res,
      statusCode: 200,
      message: "User fetch",
      data: _.pick(user, ["_id", "firstName", "lastName", "email"]),
    });
  }

  async updateUser(req, res, next) {
    // Finds the user in the database and replaces the first Name and last name values ​​with the new values.
    const updatedUser = await this.User.findByIdAndUpdate(
      req.session.user._id,
      _.pick(req.body, ["firstName", "lastName"]),
      {
        runValidators: true,
        new: true,
      }
    );

    this.response({
      res,
      statusCode: 200,
      message: "User updated",
      data: _.pick(updatedUser, ["_id", "firstName", "lastName", "email"]),
    });
  }

  async updatePassword(req, res, next) {
    const { currentPassword, password } = req.body;
    // Finds the user in the database and checks the entered password value with the password value in the database and displays the following error if it is not the same.
    const user = await this.User.findById(req.session.user._id).select("+password");
    if (!(await user.verifyPassword(currentPassword, user.password))) {
      return next(new this.ErrorResponse(401, "The current password you provided is wrong"));
    }
    // Replaces the password value with the new value, sets the passwordChangedAt field to the new date, and clears the session value.
    user.password = password;
    user.passwordChangedAt = Date.now();
    await user.save();
    res.clearCookie("sessionId");
    req.session.destroy();

    this.response({
      res,
      statusCode: 200,
      message: "Password updated successfully. Please login",
      data: null,
    });
  }
})();
