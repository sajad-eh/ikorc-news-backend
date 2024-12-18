import express from "express";
const indexRouter = express.Router();
import { isLoggined, isAdmin } from "../middleware/auth.js";

import newsRouter from "./news/newsRouter.js";
indexRouter.use("/news", newsRouter); // Redirect requests to endpoint starting with /news to newsRouter.js

import categoryRouter from "./category/categoryRouter.js";
indexRouter.use("/category", categoryRouter); // Redirect requests to endpoint starting with /category to categoryRouter.js

import authRouter from "./auth/authRouter.js";
indexRouter.use("/auth", authRouter); // Redirect requests to endpoint starting with /auth to authRouter.js

import userRouter from "./user/userRouter.js";
indexRouter.use("/user", isLoggined, userRouter); // Redirect requests to endpoint starting with /user to userRouter.js

import adminRouter from "./admin/adminRouter.js";
indexRouter.use("/admin", isLoggined, isAdmin, adminRouter); // Redirect requests to endpoint starting with /admin to adminRouter.js

export default indexRouter;
