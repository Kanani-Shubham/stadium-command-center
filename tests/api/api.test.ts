import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the environment variables needed by the server and DB client
process.env.DATABASE_URL = "postgresql://localhost:5432/mock_db";
process.env.PORT = "8080";
process.env.SESSION_SECRET = "test-secret-at-least-32-chars-long-here";

// Mock the db connection to prevent it trying to connect to PostgreSQL during tests
vi.mock("@workspace/db", () => {
  return {
    db: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue([]),
    },
    incidentsTable: {},
  };
});

// Import the express app
import app from "~api/app";

describe("API Server Integration Tests", () => {
  it("GET /api/healthz returns 200 and status ok", async () => {
    const res = await request(app).get("/api/healthz").expect("Content-Type", /json/).expect(200);

    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /api/crowd/gates returns 200 and a valid gates array", async () => {
    const res = await request(app)
      .get("/api/crowd/gates")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Check gate structure
    const gate = res.body[0];
    expect(gate).toHaveProperty("id");
    expect(gate).toHaveProperty("name");
    expect(gate).toHaveProperty("density");
    expect(gate).toHaveProperty("waitMinutes");
    expect(gate).toHaveProperty("status");
  });

  it("enforces CORS policy in production-like environment for unknown origins", async () => {
    // Set environment to production to activate restrictive CORS checks
    const oldNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.ALLOWED_ORIGINS = "https://stadiumsense.com";

    // Request from allowed origin
    const allowedRes = await request(app)
      .get("/api/healthz")
      .set("Origin", "https://stadiumsense.com")
      .expect(200);
    expect(allowedRes.headers["access-control-allow-origin"]).toBe("https://stadiumsense.com");

    // Request from non-allowed origin
    const disallowedRes = await request(app)
      .get("/api/healthz")
      .set("Origin", "https://malicioussite.com");

    // In Express CORS, an origin check failure causes the request to either be rejected or not return CORS headers.
    // Let's verify that the access-control-allow-origin header is not present.
    expect(disallowedRes.headers["access-control-allow-origin"]).toBeUndefined();

    // Reset node env
    process.env.NODE_ENV = oldNodeEnv;
  });
});
