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
      message: "News was create successful",
      data: newsCreate,
    });
  }

  async getAllNews(req, res, next) {
    const newsFind = await this.News.find();
    if (!newsFind) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    this.response({
      res,
      statusCode: 200,
      message: "News get all successful",
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
      return next(new this.ErrorResponse(404, "Not found"));
    }
    this.response({
      res,
      statusCode: 200,
      message: "News get successful",
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
      return next(new this.ErrorResponse(404, "Not found"));
    }
    this.response({
      res,
      status: "updated",
      statusCode: 200,
      message: "News was updated successful",
      data: updatedNews,
    });
  }

  async deleteNewsById(req, res, next) {
    const deletedNews = await this.News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    this.response({
      res,
      status: "deleted",
      statusCode: 200,
      message: "News deleted was successful",
      data: deletedNews,
    });
  }
})();
