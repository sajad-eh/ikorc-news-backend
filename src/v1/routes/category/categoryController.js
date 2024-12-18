import { Controller } from "../controller.js";
import Debug from "debug";
const debug = Debug("app:main");

export default new (class CategoryController extends Controller {
  async createCategory(req, res, next) {
    // If the news category exists in the database, the following error is displayed, otherwise it is stored in the database.
    const categoryFind = await this.Category.findOne({ title: req.body.title });
    if (categoryFind) {
      return next(new this.ErrorResponse(409, "Category exists"));
    }
    const categoryCreate = await this.Category.create({ title: req.body.title });

    this.response({
      res,
      statusCode: 201,
      message: "Category was create successful",
      data: categoryCreate,
    });
  }

  async getAllCategory(req, res, next) {
    const categoryFind = await this.Category.find();
    if (!categoryFind) {
      return next(new this.ErrorResponse(404, "Not found"));
    }

    this.response({
      res,
      statusCode: 200,
      message: "Category get all successful",
      data: {
        length: categoryFind.length,
        news: categoryFind,
      },
    });
  }

  async updateCategoryById(req, res, next) {
    // Finds the news category based on the ID and changes the title value and if there is no error is displayed.
    const updatedCategory = await this.Category.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title },
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return next(new this.ErrorResponse(404, "Not found"));
    }

    this.response({
      res,
      status: "updated",
      statusCode: 200,
      message: "Category was updated successful",
      data: updatedCategory,
    });
  }

  async deleteCategoryById(req, res, next) {
    // Finds and deletes the news category by ID and displays an error if it does not exist.
    const deletedCategory = await this.Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return next(new this.ErrorResponse(404, "Not found"));
    }

    this.response({
      res,
      status: "deleted",
      statusCode: 200,
      message: "Category deleted was successful",
      data: deletedCategory,
    });
  }
})();
