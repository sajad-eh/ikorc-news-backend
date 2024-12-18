import { RedisStore } from "connect-redis";
import session from "express-session";
import morgan from "morgan";
import { redisClient } from "./db.js";
import helmet from "helmet";
import hpp from "hpp";

export default function (app, express) {
  // BodyParser
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(hpp());

  // CORS Policy Definitions
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  // Static Folder
  app.use(express.static("public"));

  // Middleware
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

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
      secret: process.env.SESSION_SECRET,
      name: "sessionId",
      cookie: {
        expires: new Date(Date.now() + 600 * 1000),
        maxAge: 600 * 1000,
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: true, // if true: prevents client side JS from reading the cookie
        sameSite: "strict",
      },
    })
  );
}
