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
    let user = await this.User.findOne({ email: req.body.email });
    if (user) {
      return next(new this.ErrorResponse(400, "this user already registered please login"));
    }
    user = await this.User.create(_.pick(req.body, ["firstName", "lastName", "email", "password"]));
    await this.createOTPCodeAndSend(user);

    this.response({
      res,
      status: "pending",
      statusCode: 201,
      message: "Account opening was successful. Please check your email for confirmation",
      data: _.pick(user, ["id", "email"]),
    });
  }

  async verifyOtp(req, res, next) {
    const { userId } = req.params;
    const verificationKey = req.body.verificationKey;
    const keyFind = await this.UserVerification.findOne({
      user: userId,
      verificationKey: crypto.createHash("sha256").update(String(verificationKey)).digest("hex"),
    });
    if (!keyFind) {
      return next(new this.ErrorResponse(400, "Invalid key or has expired!"));
    }
    const user = await this.User.findByIdAndUpdate(
      { _id: userId },
      {
        verified: true,
        isActive: true,
      }
    );
    await this.UserVerification.findOneAndDelete({
      user: userId,
    });
    req.session.user = user;

    this.response({
      res,
      status: "verified",
      statusCode: 200,
      message: "User verified and login successfully.",
      data: null,
    });
  }

  async resendOTPCode(req, res, next) {
    const { userId } = req.params;
    const userFind = await this.User.findOne({ _id: userId });
    if (!userFind) {
      return next(new this.ErrorResponse(404, "User not found"));
    }
    await this.createOTPCodeAndSend(userFind);

    this.response({
      res,
      status: "pending",
      statusCode: 200,
      message: "The verification key has been sent. Please check your email for confirmation",
      data: null,
    });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    const userFind = await this.User.findOne({ email }).select("+password");
    if (!userFind) {
      return next(new this.ErrorResponse(400, "Invalid email or password"));
    }
    const isMatch = await userFind.verifyPassword(password, userFind.password);
    if (!isMatch) {
      return next(new this.ErrorResponse(400, "Invalid email or password"));
    }
    await this.createOTPCodeAndSend(userFind);

    this.response({
      res,
      statusCode: 200,
      message: "Please enter the verification code for user login",
      data: { id: userFind._id },
    });
  }

  async logout(req, res, next) {
    res.clearCookie("sessionId");
    req.session.destroy();
    return res.status(200).redirect("/login");
  }

  async forgetPassword(req, res, next) {
    const { email } = req.body;
    const userFind = await this.User.findOne({ email });
    if (!userFind) {
      return next(new this.ErrorResponse(404, `We could not find the user with given email: ${email}`));
    }
    await this.ForgetPassword.findOneAndDelete({
      user: userFind._id,
    });
    const tokenSend = crypto.randomBytes(32).toString("hex");
    await this.ForgetPassword.create({
      user: userFind._id,
      token: tokenSend,
    });
    const resetUrl = urlJoin(this.returnBaseUrl(req), "api", "v1", "auth", "resetPassword", tokenSend);
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
    const tokenFind = await this.ForgetPassword.findOne({
      token: crypto.createHash("sha256").update(token).digest("hex"),
    });
    if (!tokenFind) {
      return next(new this.ErrorResponse(400, "Token is invalid or has expired!"));
    }
    const user = await this.User.findById({ _id: tokenFind.user });
    user.password = password;
    user.passwordChangedAt = Date.now();
    user.save();
    await this.ForgetPassword.findByIdAndDelete({
      _id: tokenFind._id,
    });

    return res.status(200).redirect("/login");
  }

  async createOTPCodeAndSend(user) {
    await this.UserVerification.findOneAndDelete({
      user: user._id,
    });
    const verificationKey = cryptoRandomString({ length: 6, type: "numeric" });
    await this.UserVerification.create({
      user: user._id,
      verificationKey,
    });
    const message = `<p>Enter <b>${verificationKey}<\b> in the app to verify your email address and complete the signup process.\n\n</p>\<p>>This code <b>expires in 10 minuets<\b></p>`;
    await sendEmail({
      from: process.env.EMAIL_FROM_VERIFICATION,
      to: user.email,
      subject: "Confirmation of account opening",
      message: message,
    });
    return;
  }
})();
