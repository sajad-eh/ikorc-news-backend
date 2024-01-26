import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

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
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    // createdBy,
    // category: [{ref: 'category', title}],
    // comments: [{ user: {ref: 'user'}, comment}]
  },
  { timestamps: true }
);

newsSchema.plugin(paginate);

const News = mongoose.model("News", newsSchema);

export default News;
