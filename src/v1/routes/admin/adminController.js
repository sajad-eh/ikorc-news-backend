import { Controller } from "../controller.js";
import { sendEmail } from "../../utils/email.js";
import cryptoRandomString from "crypto-random-string";
import crypto from "crypto";
import Debug from "debug";
const debug = Debug("app:main");

export default new (class AdminController extends Controller {
  async publishNews(req, res, next) {
    const { newsId, action } = req.params;
    // If the news does not exist in the database, the following error is displayed.
    const news = await this.News.findById(newsId);
    if (!news) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    const { user } = req.session;
    await this.createOTACAndSend(user, news._id, action);

    this.response({
      res,
      status: "pending",
      statusCode: 200,
      message: "Please check your email for confirmation.",
      data: null,
    });
  }

  async verifyOTAC(req, res, next) {
    const { newsId, action } = req.params;
    const authorizationCode = req.body.authorizationCode;
    // If a one-time authorization code does not exist in the database, the following error is displayed.
    const codeFind = await this.NewsAuthorization.findOne({
      user: req.session.user._id,
      news: newsId,
      authorizationCode: crypto.createHash("sha256").update(String(authorizationCode)).digest("hex"),
    });
    if (!codeFind) {
      return next(new this.ErrorResponse(400, "Invalid code or has expired!"));
    }
    function checkAction(action) {
      if (action === "enable") {
        return true;
      } else if (action === "disable") {
        return false;
      }
    }
    // Updates the news to publish or not publish in the database based on the action sent.
    const news = await this.News.findByIdAndUpdate(
      { _id: newsId },
      {
        isActive: checkAction(action),
      },
      { new: true, runValidators: true }
    );
    await this.NewsAuthorization.findByIdAndDelete(codeFind._id);

    this.response({
      res,
      status: "verified",
      statusCode: 200,
      message: "The news has been updated.",
      data: news,
    });
  }

  async resendOTAC(req, res, next) {
    const { newsId, action } = req.params;
    // If the news does not exist in the database, the following error is displayed.
    const newsFind = await this.News.findById(newsId);
    if (!newsFind) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    const { user } = req.session;
    await this.createOTACAndSend(user, newsFind._id, action);

    this.response({
      res,
      status: "pending",
      statusCode: 200,
      message: "The authorization code has been sent. Please check your email for confirmation",
      data: null,
    });
  }

  async createOTACAndSend(user, newsId, action) {
    // If the previous one-time authorization code exists in the database, it is deleted.
    await this.NewsAuthorization.findOneAndDelete({
      user: user._id,
      news: newsId,
    });
    // Generates an 8-digit code and stores it in the database.
    const authorizationCode = cryptoRandomString({ length: 8, type: "numeric" });
    await this.NewsAuthorization.create({
      user: user._id,
      news: newsId,
      authorizationCode,
    });
    let message;
    if (action === "enable") {
      message = `<p>Please enter the authorization code <b>${authorizationCode}<\b> on the website to publish the news. This code will <b>expire in 10 minutes<\b></p>`;
    } else if (action === "disable") {
      message = `<p>Please enter the authorization code <b>${authorizationCode}<\b> on the site to prevent the news from being published. This code will <b>expire in 10 minutes<\b></p>`;
    }
    await sendEmail({
      from: process.env.EMAIL_FROM_NEWS_RELEASE,
      to: user.email,
      subject: "Authorization of news release",
      message: message,
    });
    return;
  }
})();
