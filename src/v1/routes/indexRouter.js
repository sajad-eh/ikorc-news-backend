import express from "express";
const indexRouter = express.Router();

import newsRouter from "./news/newsRouter.js";
indexRouter.use("/news", newsRouter); // Redirect requests to endpoint starting with /news to newsRouter.js

import authRouter from "./auth/authRouter.js";
indexRouter.use("/auth", authRouter); // Redirect requests to endpoint starting with /auth to authRouter.js

export default indexRouter;
