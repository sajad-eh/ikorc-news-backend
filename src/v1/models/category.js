import mongoose, { Schema } from "mongoose";

// Model Category
const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

categorySchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

const Category = mongoose.model("category", categorySchema);

export default Category;
