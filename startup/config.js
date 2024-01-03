import RedisStore from "connect-redis";
import session from "express-session";
import morgan from "morgan";
import { redisClient } from "./db.js";

export default function (app, express) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static("public"));

  // Initialize store.
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "sid:",
  });

  // Initialize session storage middleware.
  app.use(
    session({
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: process.env.SESS_KEY,
      name: "sessionId",
      cookie: {
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: true, // if true: prevents client side JS from reading the cookie
        sameSite: "strict",
      },
    })
  );

  // Middleware
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }
}
