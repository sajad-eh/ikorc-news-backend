import mongoose from "mongoose";
import { createClient } from "redis";
import Debug from "debug";
const debug = Debug("app:main");

// redis connection
const redisClient = createClient({ port: 6379, host: "localhost" });
redisClient.connect().catch((error) => {
  debug("Redis client error", error);
});

// Database connection
mongoose
  .connect(process.env.CONN_STR)
  .then((result) => {
    // debug(result)
    debug("Connection has been established successfully.");
  })
  .catch((err) => {
    debug("Unable to connect to the database", err);
  });

export default mongoose;
export { redisClient };
