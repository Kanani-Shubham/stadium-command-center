import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
      },
    },
  }),
);

// ── CORS — restrict to same Replit domain in production ──────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // Server-to-server / curl requests — allow in development only
        if (process.env["NODE_ENV"] !== "production") {
          return callback(null, true);
        }
        return callback(new Error("No origin header"), false);
      }
      // Allow any *.replit.dev subdomain (preview + deployed)
      if (/^https?:\/\/[^/]+\.replit\.dev(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Allow localhost in development
      if (process.env["NODE_ENV"] !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`), false);
    },
    credentials: true,
  }),
);

// ── Request logging ──────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

export default app;
