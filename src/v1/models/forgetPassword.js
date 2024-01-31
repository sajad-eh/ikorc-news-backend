import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

// Model ForgetPassword
const forgetPasswordSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    token: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      expires: "30m",
      default: Date.now,
    },
  },
  { timestamps: true }
);

forgetPasswordSchema.pre("save", function (next) {
  this.token = crypto.createHash("sha256").update(this.token).digest("hex");
  next();
});

const ForgetPassword = mongoose.model("forget_password", forgetPasswordSchema);

export default ForgetPassword;
