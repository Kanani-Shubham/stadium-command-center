import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"]);
export const incidentStatusEnum = pgEnum("incident_status", ["open", "in-progress", "resolved"]);
export const aiPriorityEnum = pgEnum("ai_priority", ["P1", "P2", "P3", "P4"]);

export const incidentsTable = pgTable("incidents", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  severity: severityEnum("severity").notNull().default("low"),
  status: incidentStatusEnum("status").notNull().default("open"),
  aiPriority: aiPriorityEnum("ai_priority"),
  aiRecommendation: text("ai_recommendation"),
  reportedBy: text("reported_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertIncidentSchema = createInsertSchema(incidentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidentsTable.$inferSelect;
