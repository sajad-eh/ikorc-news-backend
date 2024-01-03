import express from "express";
const versionRouter = express.Router();

import indexRouter from "./v1/routes/indexRouter.js";
versionRouter.use("/v1", indexRouter);

export default versionRouter;
