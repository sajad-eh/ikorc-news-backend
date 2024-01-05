import express from "express";
const indexRouter = express.Router();

import newsRouter from "./news/newsRouter.js";
indexRouter.use("/news", newsRouter); // Redirect requests to endpoint starting with /news to newsRouter.js

export default indexRouter;
