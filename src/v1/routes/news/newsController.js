import { Controller } from "../controller.js";
import Debug from "debug";
const debug = Debug("app:main");
import fse from "fs-extra/esm";
import path from "path";
import os from "os";
import urlJoin from "url-join";
import _ from "lodash";
import renameKeys from "rename-keys";

export default new (class AuthController extends Controller {
  // If the news item category does not exist in the database, the following error is displayed.
  async createNews(req, res, next) {
    const categoryFind = await this.Category.findOne({ title: req.body.category });
    if (!categoryFind) {
      return next(new this.ErrorResponse(400, "The entered category is not correct."));
    }
    const cover = req.file;
    // If there is no news item, the following error is displayed and the submitted news cover is deleted.
    const newsFind = await this.News.findOne({ title: req.body.title });
    if (newsFind) {
      if (cover) {
        await fse.remove(path.join(os.tmpdir(), cover.filename));
      }
      return next(new this.ErrorResponse(409, "News exists."));
    }
    // Saves the news item with the submitted data in the database.
    let newsCreate;
    const { title, description, author, newsDate } = req.body;
    if (cover) {
      await fse.move(
        path.join(os.tmpdir(), cover.filename),
        path.join(process.env.UPLOAD_DIR, "news", "covers", cover.filename)
      );
      newsCreate = await this.News.create({
        title,
        cover: cover.filename,
        description,
        author,
        newsDate,
        category: categoryFind._id,
      });
    } else {
      newsCreate = await this.News.create({
        title,
        description,
        author,
        newsDate,
        category: categoryFind._id,
      });
    }
    // If there is news coverage, the site address along with the address and the title of the cover are replaced with the title of the cover.
    if (newsCreate.cover) {
      newsCreate.cover = urlJoin(this.returnBaseUrl(req), "news", "covers", newsCreate.cover);
    }

    this.response({
      res,
      statusCode: 201,
      message: "News was create successful",
      data: newsCreate,
    });
  }

  async getAllNews(req, res, next) {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "-createdAt";
    let select;
    if (req.query.fields) {
      select = req.query.fields.split(",").join(" ");
    }
    // If the user does not exist or is not an administrator, the value of the isActive, createAt, updatedAt fields is not displayed.
    if (!req.session.user || req.session.user.role !== "admin") {
      select = "-isActive -createdAt -updatedAt";
    }
    const condition = {};
    // Sets the value of the isActive field to true so that only news that are allowed to be broadcasted are sent.
    condition["isActive"] = true;
    const query = _.pick(req.query, [
      "title",
      "description",
      "author",
      "newsDate",
      "viewsCounter",
      "category",
      "isActive",
    ]);
    for (let [key, value] of Object.entries(query)) {
      let changeValue;
      if (value instanceof Object) {
        changeValue = renameKeys(value, function (key) {
          return `$${key}`;
        });
      }
      if (key == "newsDate" || key == "viewsCounter") {
        condition[key] = changeValue || value;
      } else if (key == "isActive") {
        // If the user is an admin, it allows changing the isActive field.
        if (req.session.user && req.session.user.role === "admin") {
          condition[key] = changeValue || value;
        }
      } else if (key == "category") {
        // Gets the category field value from a query and places the category ID in the condition object if it exists in the database.
        condition[key] = { $regex: new RegExp(value), $options: "i" };
        const categoryFind = await this.Category.findOne({
          title: { $regex: new RegExp(value), $options: "i" },
        });
        condition[key] = { _id: categoryFind._id };
      } else {
        condition[key] = { $regex: new RegExp(value), $options: "i" };
      }
    }
    // Retrieves and paginates news based on the submitted queries.
    const newsFind = await this.News.paginate(condition, {
      page,
      limit,
      offset,
      sort,
      select,
      populate: { path: "category", select: "title -_id" },
    });
    // If there is no news, the following error is displayed.
    if (!newsFind.docs.length) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    // If there is news coverage, the site address along with the address and title of the cover are replaced with the title of the cover.
    newsFind.docs.map((result) => {
      if (result.cover) {
        result.cover = urlJoin(this.returnBaseUrl(req), "news", "covers", result.cover);
      }
      return;
    });

    this.response({
      res,
      statusCode: 200,
      message: "News get all successful",
      data: newsFind,
    });
  }

  async getNewsById(req, res, next) {
    // Checks that if there is no news item, the following error is displayed.
    const newsFind = await this.News.findById(req.params.id).populate({
      path: "category",
      select: "title -_id",
    });
    if (!newsFind) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    // If there is news cover, the site address along with the address and name of the cover replaces the cover name.
    if (newsFind.cover) {
      newsFind.cover = urlJoin(this.returnBaseUrl(req), "news", "covers", newsFind.cover);
    }
    await this.News.findByIdAndUpdate(newsFind._id, { viewsCounter: newsFind.viewsCounter + 1 });

    if (req.session.user && req.session.user.role === "admin") {
      this.response({
        res,
        statusCode: 200,
        message: "News get successful",
        data: newsFind,
      });
    } else if (newsFind.isActive) {
      this.response({
        res,
        statusCode: 200,
        message: "News get successful",
        data: _.pick(newsFind, [
          "_id",
          "title",
          "cover",
          "description",
          "author",
          "newsDate",
          "category",
          "viewsCounter",
        ]),
      });
    } else if (!newsFind.isActive) {
      return next(new this.ErrorResponse(403, "Access denied"));
    }
  }

  async updateNewsById(req, res, next) {
    // If the news item category does not exist in the database, the following error is displayed.
    const categoryFind = await this.Category.findOne({ title: req.body.category });
    if (!categoryFind) {
      return next(new this.ErrorResponse(400, "The entered category is not correct."));
    }
    // Updates the news item with the submitted data in the database and if there is no news item, an error is displayed.
    const { title, description, author, newsDate } = req.body;
    const updatedNews = await this.News.findByIdAndUpdate(
      req.params.id,
      { title, description, author, newsDate, category: categoryFind._id },
      { new: true, runValidators: true }
    ).populate({ path: "category", select: "title -_id" });
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

  async updateCover(req, res, next) {
    const cover = req.file;
    // Checks that if the news item does not exist, the following error is displayed.
    const newsFind = await this.News.findById(req.params.newsId);
    if (!newsFind) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    // Deletes the previous news coverage if it exists.
    if (newsFind.cover) {
      fse.remove(path.join(process.env.UPLOAD_DIR, "news", "covers", newsFind.cover));
    }
    let news;
    // If the news item cover is submitted, it stores it in the database, otherwise, it stores null in the database.
    if (cover) {
      await fse.move(
        path.join(os.tmpdir(), cover.filename),
        path.join(process.env.UPLOAD_DIR, "news", "covers", cover.filename)
      );
      news = await this.News.findByIdAndUpdate(
        req.params.newsId,
        { cover: cover.filename },
        {
          new: true,
          runValidators: true,
        }
      ).populate({ path: "category", select: "title -_id" });
      news.cover = urlJoin(this.returnBaseUrl(req), "news", "covers", news.cover);
    } else {
      news = await this.News.findByIdAndUpdate(
        req.params.newsId,
        { cover: null },
        {
          new: true,
          runValidators: true,
        }
      ).populate({ path: "category", select: "title -_id" });
    }

    this.response({
      res,
      status: "updated",
      statusCode: 200,
      message: "News cover was updated successful",
      data: news,
    });
  }

  async deleteNewsById(req, res, next) {
    // Finds and deletes the news item by ID in the database.
    const deletedNews = await this.News.findByIdAndDelete(req.params.id).populate({
      path: "category",
      select: "title -_id",
    });
    // If the news item does not exist, the following error is displayed.
    if (!deletedNews) {
      return next(new this.ErrorResponse(404, "Not found"));
    }
    // And if the news item cover exists, it deletes it.
    if (deletedNews.cover) {
      fse.remove(path.join(process.env.UPLOAD_DIR, "news", "covers", deletedNews.cover));
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
