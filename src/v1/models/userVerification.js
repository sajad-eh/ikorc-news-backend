import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

// Model UserVerification
const userVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    verificationKey: {
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

userVerificationSchema.pre("save", function (next) {
  this.verificationKey = crypto.createHash("sha256").update(this.verificationKey).digest("hex");
  next();
});

const UserVerification = mongoose.model("user_verification", userVerificationSchema);

export default UserVerification;
