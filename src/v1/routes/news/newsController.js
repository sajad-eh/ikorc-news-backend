import { Controller } from "../controller.js";
import _ from "lodash";
import Debug from "debug";
const debug = Debug("app:main");

export default new (class AuthController extends Controller {
  async createNews(req, res, next) {
    const newsCreate = await this.News.create(
      _.pick(req.body, ["title", "description", "author", "newsDate", "assortment"])
    );
    this.response({
      res,
      statusCode: 201,
      message: "خبر جدید ثبت شد",
      data: newsCreate,
    });
  }

  async getAllNews(req, res, next) {
    const newsFind = await this.News.find();
    if (!newsFind) {
      return next(new this.ErrorResponse(404, "خبر یاقت نشد"));
    }
    this.response({
      res,
      statusCode: 200,
      message: "خبر ارسال شد",
      data: {
        length: newsFind.length,
        news: newsFind.map((result) =>
          _.pick(result, ["_id", "title", "images", "description", "author", "assortment", "newsDate"])
        ),
      },
    });
  }

  async getNewsById(req, res, next) {
    const newsFind = await this.News.findById(req.params.id);
    if (!newsFind) {
      return next(new this.ErrorResponse(404, "خبر یاقت نشد"));
    }
    this.response({
      res,
      statusCode: 200,
      message: "خبر ارسال شد",
      data: _.pick(newsFind, ["_id", "title", "images", "description", "author", "assortment", "newsDate"]),
    });
  }

  async updateNewsById(req, res, next) {
    const updatedNews = await this.News.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, ["title", "description", "author", "newsDate", "assortment"]),
      { new: true, runValidators: true }
    );
    if (!updatedNews) {
      return next(new this.ErrorResponse(404, "خبر یاقت نشد"));
    }
    this.response({
      res,
      statusCode: 200,
      message: "خبر آپدیت شد",
      data: updatedNews,
    });
  }

  async deleteNewsById(req, res, next) {
    const deletedNews = await this.News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return next(new this.ErrorResponse(404, "خبر یاقت نشد"));
    }
    this.response({
      res,
      statusCode: 200,
      message: "خبر پاک شد",
      data: deletedNews,
    });
  }
})();
