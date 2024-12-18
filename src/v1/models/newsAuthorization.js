import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

// Model NewsAuthorization
const newsAuthorizationSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    news: {
      type: Schema.Types.ObjectId,
      ref: "news",
    },
    authorizationCode: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      expires: "10m",
      default: Date.now,
    },
  },
  { timestamps: true }
);

newsAuthorizationSchema.pre("save", function (next) {
  this.authorizationCode = crypto.createHash("sha256").update(this.authorizationCode).digest("hex");
  next();
});

const NewsAuthorization = mongoose.model("news_authorization", newsAuthorizationSchema);

export default NewsAuthorization;
