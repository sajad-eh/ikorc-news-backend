import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

// Model UserAuthorization
const userAuthorizationSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
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

userAuthorizationSchema.pre("save", function (next) {
  this.authorizationCode = crypto.createHash("sha256").update(this.authorizationCode).digest("hex");
  next();
});

const UserAuthorization = mongoose.model("user_authorization", userAuthorizationSchema);

export default UserAuthorization;
