import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

// Model News
const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    cover: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    newsDate: {
      type: Date,
      default: Date.now,
    },
    viewsCounter: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    category: { type: Schema.Types.ObjectId, required: true, ref: "category" },
  },
  { timestamps: true, versionKey: false }
);

newsSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

newsSchema.plugin(paginate);

const News = mongoose.model("News", newsSchema);

export default News;
