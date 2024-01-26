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
mongoose.connect(process.env.CONN_STR);
mongoose.connection.on("connected", (result) => {
  // debug(result);
  debug("The connection to the database was successfully established.");
});
mongoose.connection.on("error", (err) => {
  debug("Unable to connect to the database: ", err);
});
mongoose.connection.on("disconnected", () => {
  debug("The connection to the database was lost.");
});

export default mongoose;
export { redisClient };
