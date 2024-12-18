import User from "../models/user.js";
import ErrorResponse from "../utils/errorResponse.js";
import Debug from "debug";
const debug = Debug("app:main");

// Checks that the user is logged in, verified, and active.
export async function isLoggined(req, res, next) {
  if (!req.session.user) {
    return next(new ErrorResponse(401, "Access denied"));
  }
  const user = await User.findById(req.session.user._id);
  if (!user) {
    res.clearCookie("sessionId");
    req.session.destroy();
    return res.status(404).redirect("/login");
  }
  if (user.verified === false || user.isActive === false) {
    res.clearCookie("sessionId");
    req.session.destroy();
    return res.status(404).redirect("/login");
  }
  // Delete the session if the password has been changed.
  if (user.passwordChangedAt && new Date() < user.passwordChangedAt) {
    res.clearCookie("sessionId");
    req.session.destroy();
    return res.status(404).redirect("/login");
  }
  next();
}

// Checks whether the logged in user is authenticated and active.
export async function ChecksLogin(req, res, next) {
  if (req.session.user) {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      res.clearCookie("sessionId");
      req.session.destroy();
      return res.status(404).redirect("/login");
    }
    if (user.verified === false || user.isActive === false) {
      res.clearCookie("sessionId");
      req.session.destroy();
      return res.status(404).redirect("/login");
    }
    // Delete the session if the password has been changed.
    if (user.passwordChangedAt && new Date() < user.passwordChangedAt) {
      res.clearCookie("sessionId");
      req.session.destroy();
      return res.status(404).redirect("/login");
    }
  }
  next();
}

// Checks if the user is an admin.
export async function isAdmin(req, res, next) {
  if (!(req.session.user.role === "admin")) {
    return next(new ErrorResponse(403, "Access denied"));
  }
  next();
}
