import rateLimit from "express-rate-limit";

const MINUTE_MS = 60 * 1_000;

/** Rate limiter for AI endpoints — 30 requests per minute per IP */
export const aiRateLimiter = rateLimit({
  windowMs: MINUTE_MS,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait before making another AI request." },
});

/** Rate limiter for incident creation — 10 per minute per IP */
export const incidentRateLimiter = rateLimit({
  windowMs: MINUTE_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many incident reports submitted. Please wait." },
});
