import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is a required "],
      unique: true,
      trim: true,
    },
    images: [String],
    description: {
      type: String,
      required: [true, "Description is a required "],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is a required "],
      trim: true,
    },
    newsDate: {
      type: Date,
      default: Date.now,
    },
    assortment: [String],
  },
  { timestamps: true }
);

const News = mongoose.model("News", newsSchema);

export default News;
