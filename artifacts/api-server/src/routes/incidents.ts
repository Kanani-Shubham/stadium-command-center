import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, incidentsTable } from "@workspace/db";
import {
  CreateIncidentBody,
  UpdateIncidentBody,
  UpdateIncidentParams,
  ListIncidentsResponse,
  CreateIncidentResponse,
  UpdateIncidentResponse,
} from "@workspace/api-zod";
import { incidentRateLimiter } from "../lib/rateLimiter";

const router: IRouter = Router();

interface IncidentData {
  id: number;
  location: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  reportedBy: string | null;
  aiPriority: "P1" | "P2" | "P3" | "P4" | null;
  aiRecommendation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback database
const mockIncidents: IncidentData[] = [
  {
    id: 101,
    location: "Gate A",
    description: "Crowd congestion building near ticket scanners.",
    severity: "medium",
    status: "open",
    reportedBy: "Operator Alpha",
    aiPriority: "P3",
    aiRecommendation: "Open secondary queues at Gate A and dispatch support stewards.",
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 102,
    location: "Section 104",
    description: "Medical alert - minor dehydration reported.",
    severity: "low",
    status: "in-progress",
    reportedBy: "Steward Bravo",
    aiPriority: "P4",
    aiRecommendation: "Dispatch nearest first-aid responder from South Station with fluids.",
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 1200000),
  }
];

let nextMockId = 103;
let useDbMockFallback = false;

// Helper to determine if we should fall back to mock database
async function executeQuery<T>(dbQuery: () => Promise<T>, fallbackAction: () => T): Promise<T> {
  if (useDbMockFallback) {
    return fallbackAction();
  }
  try {
    return await dbQuery();
  } catch (err: unknown) {
    const error = err as Record<string, any>;
    if (
      error.message?.includes("ECONNREFUSED") ||
      error.code === "ECONNREFUSED" ||
      error.message?.includes("connection") ||
      error.message?.includes("does not exist") ||
      error.message?.includes("relation")
    ) {
      console.warn("⚠️ Database connection failed or database relation not found. Falling back to in-memory incidents mock store.");
      useDbMockFallback = true;
      return fallbackAction();
    }
    throw err;
  }
}

router.get("/incidents", async (_req, res): Promise<void> => {
  try {
    const rows = await executeQuery(
      () => db.select().from(incidentsTable).orderBy(incidentsTable.createdAt),
      () => [...mockIncidents].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    );

    res.json(ListIncidentsResponse.parse(rows.reverse()));
  } catch (err) {
    _req.log?.error({ err }, "Failed to list incidents");
    res.status(500).json({ error: "Failed to retrieve incidents" });
  }
});

router.post("/incidents", incidentRateLimiter, async (req, res): Promise<void> => {
  const parsed = CreateIncidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const incident = await executeQuery(
      async () => {
        const [inserted] = await db
          .insert(incidentsTable)
          .values({
            location: parsed.data.location,
            description: parsed.data.description,
            severity: parsed.data.severity,
            reportedBy: parsed.data.reportedBy ?? null,
            status: "open",
          })
          .returning();
        return inserted;
      },
      () => {
        const newIncident = {
          id: nextMockId++,
          location: parsed.data.location,
          description: parsed.data.description,
          severity: parsed.data.severity,
          reportedBy: parsed.data.reportedBy ?? null,
          status: "open" as const,
          aiPriority: null,
          aiRecommendation: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockIncidents.push(newIncident);
        return newIncident;
      }
    );

    res.status(201).json(CreateIncidentResponse.parse(incident));
  } catch (err) {
    req.log?.error({ err }, "Failed to create incident");
    res.status(500).json({ error: "Failed to create incident" });
  }
});

router.patch("/incidents/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = UpdateIncidentParams.safeParse({ id: parseInt(rawId ?? "0", 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateIncidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const updateData: Partial<typeof incidentsTable.$inferInsert> = { updatedAt: new Date() };
    if (parsed.data.status !== undefined) updateData["status"] = parsed.data.status;
    if (parsed.data.aiPriority !== undefined) updateData["aiPriority"] = parsed.data.aiPriority;
    if (parsed.data.aiRecommendation !== undefined) updateData["aiRecommendation"] = parsed.data.aiRecommendation;

    const incident = await executeQuery(
      async () => {
        const [updated] = await db
          .update(incidentsTable)
          .set(updateData)
          .where(eq(incidentsTable.id, params.data.id))
          .returning();
        return updated;
      },
      () => {
        const idx = mockIncidents.findIndex((item) => item.id === params.data.id);
        if (idx === -1) return null;
        const current = mockIncidents[idx]!;
        const updated = {
          ...current,
          ...updateData,
        };
        mockIncidents[idx] = updated;
        return updated;
      }
    );

    if (!incident) {
      res.status(404).json({ error: "Incident not found" });
      return;
    }

    res.json(UpdateIncidentResponse.parse(incident));
  } catch (err) {
    req.log?.error({ err }, "Failed to update incident");
    res.status(500).json({ error: "Failed to update incident" });
  }
});

export default router;
