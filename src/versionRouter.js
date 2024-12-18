import express from "express";
const versionRouter = express.Router();

import indexRouter from "./v1/routes/indexRouter.js";
versionRouter.use("/v1", indexRouter); // Redirect requests to endpoint starting with /v1 to indexRouter.js

export default versionRouter;
