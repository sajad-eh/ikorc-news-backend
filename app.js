// import & load env
import "dotenv/config";
import express from "express";
const app = express();

// import debug npm & config
import Debug from "debug";
const debug = Debug("app:main");

// import error response
import ErrorResponse from "./src/v1/utils/errorResponse.js";
// import error handler
import errorHandler from "./src/v1/middleware/errorHandler.js";

// import module app & express & config
import module from "./startup/config.js";
module(app, express);

// import db
import "./startup/db.js";

// import logging
import logging from "./startup/logging.js";
logging();

// routes import
import versionRouter from "./src/versionRouter.js";
// routes
app.use("/api", versionRouter);

// error controller
app.use("*", (req, res, next) => {
  return next(new ErrorResponse(404, `Can't find ${req.originalUrl} on the server!`));
});
app.use(errorHandler); // Global error handler. IMPORTANT function params MUST start with err

const port = process.env.PORT || 3000;
const productionMode = process.env.NODE_ENV === "production";
app.listen(port, () =>
  debug(`Server running in ${productionMode ? "production" : "development"} mode on port ${port}`)
);
