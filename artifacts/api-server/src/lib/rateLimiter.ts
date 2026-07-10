import rateLimit from "express-rate-limit";

/** Rate limiter for AI endpoints — 30 requests per minute per IP */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait before making another AI request." },
});

/** Rate limiter for incident creation — 10 per minute per IP */
export const incidentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many incident reports submitted. Please wait." },
});
