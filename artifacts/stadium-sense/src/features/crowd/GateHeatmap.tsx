import React, { memo } from "react";
import type { GateCrowdData } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface GateHeatmapProps {
  gates: GateCrowdData[];
}

const STATUS_COLORS: Record<GateCrowdData["status"], string> = {
  critical: "bg-destructive text-destructive-foreground",
  congested: "bg-amber-500 text-white",
  closed: "bg-muted text-muted-foreground",
  open: "bg-emerald-500 text-white",
};

const WAIT_HIGH_MINUTES = 15;
const WAIT_MEDIUM_MINUTES = 10;
const WAIT_BAR_MAX_MINUTES = 20;

function getStatusColor(status: GateCrowdData["status"]): string {
  return STATUS_COLORS[status];
}

function getStatusDotClass(status: GateCrowdData["status"]): string {
  return STATUS_COLORS[status]?.split(" ")[0] ?? "bg-emerald-500";
}

function getWaitBarClass(waitMinutes: number): string {
  if (waitMinutes > WAIT_HIGH_MINUTES) return "bg-destructive";
  if (waitMinutes > WAIT_MEDIUM_MINUTES) return "bg-amber-500";
  return "bg-primary";
}

function getWaitTextClass(waitMinutes: number): string {
  if (waitMinutes > WAIT_HIGH_MINUTES) return "text-destructive";
  if (waitMinutes > WAIT_MEDIUM_MINUTES) return "text-amber-500";
  return "";
}

function GateCard({ gate }: { gate: GateCrowdData }) {
  const waitBarWidth = Math.min((gate.waitMinutes / WAIT_BAR_MAX_MINUTES) * 100, 100);

  return (
    <article
      className="flex flex-col border rounded-lg overflow-hidden bg-card shadow-sm hover-elevate transition-all"
      aria-label={`${gate.name}: ${Math.round(gate.density * 100)}% density, ${gate.waitMinutes} minute wait, status ${gate.status}`}
    >
      <div className="p-2.5 flex justify-between items-center border-b bg-muted/20">
        <span className="font-semibold text-sm truncate" title={gate.name}>
          {gate.name}
        </span>
        <div
          className={cn("h-2.5 w-2.5 rounded-full", getStatusDotClass(gate.status))}
          role="img"
          aria-label={`Status: ${gate.status}`}
        />
      </div>

      <div className="p-3 relative overflow-hidden flex flex-col gap-3 flex-1">
        {/* Density fill bar — purely decorative */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out bg-primary/10"
          style={{ height: `${gate.density * 100}%` }}
        />

        <div className="relative z-10 flex justify-between items-end">
          <div className="text-xs text-muted-foreground">Density</div>
          <div className="font-mono text-sm font-medium">{(gate.density * 100).toFixed(0)}%</div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Wait time</span>
            <span className={cn("font-mono font-medium", getWaitTextClass(gate.waitMinutes))}>
              {gate.waitMinutes}m
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden" role="progressbar" aria-valuenow={gate.waitMinutes} aria-valuemin={0} aria-valuemax={WAIT_BAR_MAX_MINUTES} aria-label={`Wait time: ${gate.waitMinutes} minutes`}>
            <div
              className={cn("h-full transition-all rounded-full", getWaitBarClass(gate.waitMinutes))}
              style={{ width: `${waitBarWidth}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

const MemoizedGateCard = memo(GateCard);

/** Heatmap grid of stadium gates grouped by section. */
export const GateHeatmap = memo(function GateHeatmap({ gates }: GateHeatmapProps) {
  const sections = Array.from(new Set(gates.map((g) => g.section))).sort();

  return (
    <div className="space-y-8" role="region" aria-label="Gate density heatmap">
      {sections.map((section) => {
        const sectionGates = gates.filter((g) => g.section === section);
        return (
          <section key={section} aria-labelledby={`section-${section}`}>
            <h3
              id={`section-${section}`}
              className="text-sm font-semibold tracking-tight border-b pb-1 mb-3"
            >
              {section}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {sectionGates.map((gate) => (
                <MemoizedGateCard key={gate.id} gate={gate} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
});
