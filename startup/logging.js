// import express-async-errors npm package & handler async error
import "express-async-errors";
import winston from "winston";

// import debug & config
import Debug from "debug";
const debug = Debug("app:main");

export default function () {
  // uncaught exception error handler
  process.on("uncaughtException", (ex) => {
    debug(ex);
    winston.error(ex.message, ex);
    process.exit(1);
  });

  // unhandled rejection error handler
  process.on("unhandledRejection", (ex) => {
    debug(ex);
    winston.error(ex.message, ex);
    process.exit(1);
  });

  // winston add log file
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
}
