import 'dotenv/config'
import express from "express";
const app = express();

import Debug from "debug";
const debug = Debug("app:main");

import ErrorResponse from "./src/v1/utils/errorResponse.js";
import errorHandler from "./src/v1/middleware/errorHandler.js";

import module from "./startup/config.js";
module(app, express);
debug(1)
import "./startup/db.js";
import logging from "./startup/logging.js";
logging();

import versionRouter from "./src/versionRouter.js";
app.use("/api", versionRouter);

app.all("*", (req, res, next) => {
  return next(new ErrorResponse(404, `Can't find ${req.originalUrl} on the server!`));
});

app.use(errorHandler); // Global error handler. IMPORTANT function params MUST start with err

const port = process.env.PORT || 3000;
app.listen(port, () => debug(`listening on port ${port}`));
