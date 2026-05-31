import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const webDist = path.join(__dirname, "../../web/dist/public");
  const adminDist = path.join(__dirname, "../../admin/dist/public");

  app.use("/admin", express.static(adminDist));
  app.get(/^\/admin(\/.*)?$/, (_req, res) => {
    res.sendFile(path.join(adminDist, "index.html"));
  });

  app.use(express.static(webDist));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

export default app;
