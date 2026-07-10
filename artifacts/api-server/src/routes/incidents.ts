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

router.get("/incidents", async (_req, res): Promise<void> => {
  const incidents = await db
    .select()
    .from(incidentsTable)
    .orderBy(incidentsTable.createdAt);

  res.json(ListIncidentsResponse.parse(incidents.reverse()));
});

router.post("/incidents", incidentRateLimiter, async (req, res): Promise<void> => {
  const parsed = CreateIncidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [incident] = await db
    .insert(incidentsTable)
    .values({
      location: parsed.data.location,
      description: parsed.data.description,
      severity: parsed.data.severity,
      reportedBy: parsed.data.reportedBy ?? null,
      status: "open",
    })
    .returning();

  res.status(201).json(CreateIncidentResponse.parse(incident));
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

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status !== undefined) updateData["status"] = parsed.data.status;
  if (parsed.data.aiPriority !== undefined) updateData["aiPriority"] = parsed.data.aiPriority;
  if (parsed.data.aiRecommendation !== undefined) updateData["aiRecommendation"] = parsed.data.aiRecommendation;

  const [incident] = await db
    .update(incidentsTable)
    .set(updateData)
    .where(eq(incidentsTable.id, params.data.id))
    .returning();

  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }

  res.json(UpdateIncidentResponse.parse(incident));
});

export default router;
