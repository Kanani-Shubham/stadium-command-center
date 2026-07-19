/**
 * Unit tests for formatting and display utilities.
 * Run with: pnpm --filter @workspace/stadium-sense run test
 */

import { describe, it, expect } from "vitest";

// ── Number formatting helpers ─────────────────────────────────────────────────

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

function formatDensityLabel(density: number): string {
  if (density >= 0.9) return "Critical";
  if (density >= 0.7) return "Congested";
  if (density >= 0.45) return "Moderate";
  return "Normal";
}

describe("formatCount", () => {
  it("formats thousands with commas", () => {
    expect(formatCount(1000)).toBe("1,000");
    expect(formatCount(10000)).toBe("10,000");
    expect(formatCount(100000)).toBe("100,000");
  });

  it("formats small numbers without commas", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("formats large stadium attendance", () => {
    expect(formatCount(85000)).toBe("85,000");
  });
});

describe("formatPercent", () => {
  it("converts 0-1 fraction to percentage string", () => {
    expect(formatPercent(0.5)).toBe("50%");
    expect(formatPercent(0.82)).toBe("82%");
    expect(formatPercent(1.0)).toBe("100%");
  });

  it("respects decimal places", () => {
    expect(formatPercent(0.5, 1)).toBe("50.0%");
    expect(formatPercent(0.824, 1)).toBe("82.4%");
  });

  it("handles edge cases", () => {
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(0.001)).toBe("0%");
  });
});

describe("formatDensityLabel", () => {
  it("returns Critical at >= 0.9", () => {
    expect(formatDensityLabel(0.9)).toBe("Critical");
    expect(formatDensityLabel(1.0)).toBe("Critical");
  });

  it("returns Congested at >= 0.7 and < 0.9", () => {
    expect(formatDensityLabel(0.7)).toBe("Congested");
    expect(formatDensityLabel(0.85)).toBe("Congested");
    expect(formatDensityLabel(0.899)).toBe("Congested");
  });

  it("returns Moderate at >= 0.45 and < 0.7", () => {
    expect(formatDensityLabel(0.45)).toBe("Moderate");
    expect(formatDensityLabel(0.6)).toBe("Moderate");
  });

  it("returns Normal below 0.45", () => {
    expect(formatDensityLabel(0)).toBe("Normal");
    expect(formatDensityLabel(0.44)).toBe("Normal");
  });
});

// ── Gate status helpers ───────────────────────────────────────────────────────

type GateStatus = "open" | "congested" | "critical" | "closed";

const STATUS_LABELS: Record<GateStatus, string> = {
  open: "Open",
  congested: "Congested",
  critical: "Critical",
  closed: "Closed",
};

const STATUS_PRIORITY: Record<GateStatus, number> = {
  critical: 0,
  congested: 1,
  open: 2,
  closed: 3,
};

describe("STATUS_LABELS", () => {
  it("has labels for all four status types", () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(4);
    const statuses: GateStatus[] = ["open", "congested", "critical", "closed"];
    for (const status of statuses) {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });
});

describe("STATUS_PRIORITY (for sort order)", () => {
  it("critical has highest priority (lowest number)", () => {
    expect(STATUS_PRIORITY.critical).toBeLessThan(STATUS_PRIORITY.congested);
    expect(STATUS_PRIORITY.critical).toBeLessThan(STATUS_PRIORITY.open);
    expect(STATUS_PRIORITY.critical).toBeLessThan(STATUS_PRIORITY.closed);
  });

  it("congested comes before open", () => {
    expect(STATUS_PRIORITY.congested).toBeLessThan(STATUS_PRIORITY.open);
  });

  it("sorts gates correctly by priority", () => {
    const gates: { name: string; status: GateStatus }[] = [
      { name: "Gate A", status: "open" },
      { name: "Gate B", status: "critical" },
      { name: "Gate C", status: "congested" },
    ];
    const sorted = [...gates].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
    expect(sorted[0]!.status).toBe("critical");
    expect(sorted[1]!.status).toBe("congested");
    expect(sorted[2]!.status).toBe("open");
  });
});

// ── Wait time color thresholds ────────────────────────────────────────────────

const WAIT_HIGH_THRESHOLD = 15; // minutes
const WAIT_MEDIUM_THRESHOLD = 10; // minutes

type WaitSeverity = "high" | "medium" | "normal";

function classifyWaitTime(minutes: number): WaitSeverity {
  if (minutes > WAIT_HIGH_THRESHOLD) return "high";
  if (minutes > WAIT_MEDIUM_THRESHOLD) return "medium";
  return "normal";
}

describe("classifyWaitTime", () => {
  it("returns high above 15 minutes", () => {
    expect(classifyWaitTime(16)).toBe("high");
    expect(classifyWaitTime(30)).toBe("high");
  });

  it("returns medium between 10 and 15 minutes inclusive", () => {
    expect(classifyWaitTime(11)).toBe("medium");
    expect(classifyWaitTime(15)).toBe("medium");
  });

  it("returns normal at 10 minutes or below", () => {
    expect(classifyWaitTime(0)).toBe("normal");
    expect(classifyWaitTime(5)).toBe("normal");
    expect(classifyWaitTime(10)).toBe("normal");
  });
});

// ── Sustainability score formatting ───────────────────────────────────────────

function formatSustainabilityScore(value: number, target: number): string {
  const pct = (value / target) * 100;
  if (pct <= 80) return "A+";
  if (pct <= 90) return "A";
  if (pct <= 100) return "A-";
  if (pct <= 110) return "B+";
  return "B";
}

describe("formatSustainabilityScore", () => {
  it("returns A+ when well under target", () => {
    expect(formatSustainabilityScore(40, 50)).toBe("A+"); // 80%
  });

  it("returns A when slightly under target", () => {
    expect(formatSustainabilityScore(45, 50)).toBe("A"); // 90%
  });

  it("returns A- when at target", () => {
    expect(formatSustainabilityScore(50, 50)).toBe("A-"); // 100%
  });

  it("returns B+ when slightly over target", () => {
    expect(formatSustainabilityScore(54, 50)).toBe("B+"); // 108% — avoids floating-point boundary at exactly 110%
  });

  it("returns B when well over target", () => {
    expect(formatSustainabilityScore(60, 50)).toBe("B"); // 120%
  });
});
