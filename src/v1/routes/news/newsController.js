import { Controller } from "../controller.js";
import _ from "lodash";
import Debug from "debug";
const debug = Debug("app:main");
import fse from "fs-extra/esm";
import path from "path";
import os from "os";

export default new (class AuthController extends Controller {
  async createNews(req, res, next) {
    const cover = req.file;
    const newsFind = await this.News.findOne({ title: req.body.title });
    if (newsFind) {
      if (cover) {
        await fse.remove(path.join(os.tmpdir(), cover.filename));
      }
      return next(new this.ErrorResponse(409, "News exists"));
    }
    let newsCreate;
    if (cover) {
      await fse.move(
        path.join(os.tmpdir(), cover.filename),
        path.join(process.env.UPLOAD_DIR, "news", "covers", cover.filename)
      );
      const { title, description, author, newsDate } = req.body;
      newsCreate = await this.News.create({
        title,
        cover: cover.filename,
        description,
        author,
        newsDate,
      });
    } else {
      newsCreate = await this.News.create(_.pick(req.body, ["title", "description", "author", "newsDate"]));
    }
    if (newsCreate.cover) {
      const imageUrl = this.createUrlImage(req, path.join("news", "covers"), newsCreate.cover);
      newsCreate.cover = imageUrl;
    } else {
      newsCreate.cover = null;
    }

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
          _.pick(result, ["_id", "title", "images", "description", "author", "newsDate"])
        ),
      },
    });
  }

  async getNewsById(req, res, next) {
    const newsFind = await this.News.findById(req.params.id);
    if (!newsFind) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    if (newsFind.cover) {
      const imageUrl = this.createUrlImage(req, path.join("news", "covers"), newsFind.cover);
      newsFind.cover = imageUrl;
    } else {
      newsFind.cover = null;
    }

    this.response({
      res,
      statusCode: 200,
      message: "News get successful",
      data: _.pick(newsFind, ["_id", "title", "cover", "description", "author", "newsDate"]),
    });
  }

  async updateNewsById(req, res, next) {
    const updatedNews = await this.News.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, ["title", "description", "author", "newsDate"]),
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
