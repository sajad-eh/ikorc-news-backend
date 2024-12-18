import { Controller } from "../controller.js";
import { sendEmail } from "../../utils/email.js";
import _ from "lodash";
import crypto from "crypto";
import cryptoRandomString from "crypto-random-string";
import urlJoin from "url-join";
import Debug from "debug";
const debug = Debug("app:main");

export default new (class AuthController extends Controller {
  async register(req, res, next) {
    // Checks that the entered email exists in the database.
    let user = await this.User.findOne({ email: req.body.email });
    // If the entered email exists in the database, the following error will be show.
    if (user) {
      return next(new this.ErrorResponse(400, "this user already registered please login"));
    }
    // Registering a user in the database.
    user = await this.User.create(_.pick(req.body, ["firstName", "lastName", "email", "password"]));
    // Send authorization code to user.
    await this.createOTACAndSend(user, "register");

    this.response({
      res,
      status: "pending",
      statusCode: 201,
      message: "Account opening was successful. Please check your email for confirmation",
      data: _.pick(user, ["id", "email"]),
    });
  }

  async loginWithPassword(req, res, next) {
    const { email, password } = req.body;
    // Checks that the entered email exists in the database.
    const userFind = await this.User.findOne({ email }).select("+password");
    // If the entered email does not exist in the database, the following error will be shown.
    if (!userFind) {
      return next(new this.ErrorResponse(400, "Invalid email or password"));
    }
    // It checks if the entered password is the same as the password in the database. Otherwise, it displays the following error.
    const isMatch = await userFind.verifyPassword(password, userFind.password);
    if (!isMatch) {
      return next(new this.ErrorResponse(400, "Invalid email or password"));
    }
    // Checks the user is authenticated or not. Otherwise, it displays the following error.
    if (userFind.verified === false) {
      // Send authorization code to user.
      await this.createOTACAndSend(userFind, "verify");
      return next(
        new this.ErrorResponse(401, "User not verified. Please check your email for verification.", {
          id: userFind._id,
        })
      );
    }
    // Checks if the user is active. Otherwise, it displays the following error.
    if (userFind.isActive === false) {
      return next(new this.ErrorResponse(401, "User is not active"));
    }
    req.session.user = userFind;

    this.response({
      res,
      statusCode: 200,
      message: "User login successfully.",
      data: null,
    });
  }

  async loginWithOTAC(req, res, next) {
    // Checks that the entered email exists in the database.
    const userFind = await this.User.findOne({ email: req.body.email });
    // If the entered email does not exist in the database, the following error will be shown.
    if (!userFind) {
      return next(new this.ErrorResponse(400, "Invalid email, please register."));
    }
    // Checks the user is authenticated or not. Otherwise, it displays the following error.
    if (userFind.verified === false) {
      // Send authorization code to user.
      await this.createOTACAndSend(userFind, "verify");
      return next(
        new this.ErrorResponse(401, "User not verified. Please check your email for verification.", {
          id: userFind._id,
        })
      );
    }
    // Checks if the user is active. Otherwise, it displays the following error.
    if (userFind.isActive === false) {
      return next(new this.ErrorResponse(401, "User is not active"));
    }
    // Send authorization code to user.
    await this.createOTACAndSend(userFind, "login");

    this.response({
      res,
      status: "pending",
      statusCode: 200,
      message: "Please check your email and enter the one-time code to login.",
      data: { id: userFind.id },
    });
  }

  async logout(req, res, next) {
    res.clearCookie("sessionId");
    req.session.destroy();

    this.response({
      res,
      statusCode: 200,
      message: "The user logout successfully",
      data: null,
    });
  }

  async verifyOTAC(req, res, next) {
    const { userId } = req.params;
    const authorizationCode = req.body.authorizationCode;
    // Checks that the entered authorization code exists in the database.
    const codeFind = await this.UserAuthorization.findOne({
      user: userId,
      authorizationCode: crypto.createHash("sha256").update(String(authorizationCode)).digest("hex"),
    });
    // If the entered authorization code does not exist in the database, the following error will be displayed.
    if (!codeFind) {
      return next(new this.ErrorResponse(400, "Invalid code or has expired!"));
    }
    const user = await this.User.findById(userId);
    await this.UserAuthorization.findByIdAndDelete(codeFind._id);
    req.session.user = user;

    this.response({
      res,
      status: "verified",
      statusCode: 200,
      message: "User login successfully.",
      data: null,
    });
  }

  async verifyUserWithOTAC(req, res, next) {
    const { userId } = req.params;
    const authorizationCode = req.body.authorizationCode;
    // Checks that the entered authorization code exists in the database.
    const codeFind = await this.UserAuthorization.findOne({
      user: userId,
      authorizationCode: crypto.createHash("sha256").update(String(authorizationCode)).digest("hex"),
    });
    // If the entered authorization code does not exist in the database, the following error will be displayed.
    if (!codeFind) {
      return next(new this.ErrorResponse(400, "Invalid code or has expired!"));
    }
    // Finds the user in the database and activates and verifies it.
    const user = await this.User.findByIdAndUpdate(
      { _id: userId },
      {
        verified: true,
        isActive: true,
      },
      { new: true, runValidators: true }
    );
    await this.UserAuthorization.findByIdAndDelete(codeFind._id);
    req.session.user = user;

    this.response({
      res,
      status: "verified",
      statusCode: 200,
      message: "User verified and login successfully.",
      data: null,
    });
  }

  async resendOTAC(req, res, next) {
    const { userId } = req.params;
    const userFind = await this.User.findById(userId);
    // If the user does not exist in the database, the following error is shown.
    if (!userFind) {
      return next(new this.ErrorResponse(404, "User not found"));
    }
    // Send authorization code to user.
    await this.createOTACAndSend(userFind, "resend");

    this.response({
      res,
      status: "pending",
      statusCode: 200,
      message: "The authorization code has been sent. Please check your email for confirmation",
      data: null,
    });
  }

  async forgetPassword(req, res, next) {
    const { email } = req.body;
    const userFind = await this.User.findOne({ email });
    //  If the entered email does not exist in the database, the following error will be shown.
    if (!userFind) {
      return next(new this.ErrorResponse(404, `We could not find the user with given email: ${email}`));
    }
    // Clears the previous token value in the database.
    await this.ForgetPassword.findOneAndDelete({
      user: userFind._id,
    });
    // Creates a token and stores it in the database.
    const tokenSend = crypto.randomBytes(32).toString("hex");
    await this.ForgetPassword.create({
      user: userFind._id,
      token: tokenSend,
    });
    // Creates a url with the path and token and emails it to the user along with a message.
    const resetUrl = urlJoin(this.returnBaseUrl(req), "api", "v1", "auth", "reset-password", tokenSend);
    const message = `We have received an account opening request. Please use the link below to verify your email\n\n${resetUrl}\n\nThis password reset link will only be valid for 30 minutes.`;
    await sendEmail({
      from: process.env.EMAIL_FROM_RESET_PASS,
      to: userFind.email,
      subject: "Password change request received",
      message: message,
    });

    this.response({
      res,
      status: "pending",
      statusCode: 200,
      message: "Password reset link send to the user email. Please check your email",
      data: null,
    });
  }

  async resetPassword(req, res, next) {
    const { token } = req.params;
    const { password } = req.body;
    // Checks that the entered token exists in the database.
    const tokenFind = await this.ForgetPassword.findOne({
      token: crypto.createHash("sha256").update(token).digest("hex"),
    });
    // If the entered token does not exist in the database, the following error will be shown.
    if (!tokenFind) {
      return next(new this.ErrorResponse(400, "Token is invalid or has expired!"));
    }
    // Finds the user in the database, replaces the password value with the new value, and sets the passwordChangedAt field to the new date.
    const user = await this.User.findById(tokenFind.user);
    user.password = password;
    user.passwordChangedAt = Date.now();
    user.save();
    await this.ForgetPassword.findByIdAndDelete(tokenFind._id);

    this.response({
      res,
      statusCode: 200,
      message: "Password reset successfully. Please login",
      data: null,
    });
  }

  async createOTACAndSend(user, action) {
    // Clears the previous authorization code value in the database.
    await this.UserAuthorization.findOneAndDelete({
      user: user._id,
    });
    // Create and stores authorization code in database.
    const authorizationCode = cryptoRandomString({ length: 6, type: "numeric" });
    await this.UserAuthorization.create({
      user: user._id,
      authorizationCode,
    });
    // Emails the authorization code along with a message to the user.
    let message;
    if (action === "register") {
      message = `<p>Please enter the authorization code <b>${authorizationCode}<\b> in the website to verify your email address and complete the registration process.\n\n</p>\<p>>This code will <b>expire in 10 minutes.<\b></p>`;
    } else if (action === "login") {
      message = `<p>Please enter authorization code <b>${authorizationCode}<\b> on the website to log in.\n\n</p>\<p>>This code will <b>expire in 10 minutes.<\b></p>`;
    } else if (action === "resend") {
      message = `<p>Please enter authorization code <b>${authorizationCode}<\b> on the website.\n\n</p>\<p>>This code will <b>expire in 10 minutes.<\b></p>`;
    } else if (action === "verify") {
      message = `<p>Please enter the authorization code <b>${authorizationCode}<\b> on the website to verify your email address and complete the user verification process.\n\n</p>\<p>>This code will <b>expire in 10 minutes.<\b></p>`;
    }

    await sendEmail({
      from: process.env.EMAIL_FROM_AUTHORIZATION,
      to: user.email,
      subject: "Confirmation of account opening",
      message: message,
    });
    return;
  }
})();
