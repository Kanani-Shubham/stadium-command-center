/** Named constants — avoids magic numbers throughout crowd simulation */
const CROWD_WINDOW_MS = 30_000; // seed rotates every 30 s
const JITTER_RANGE = 20; // ±10% jitter divisor
const JITTER_OFFSET = 0.1;
const FLOW_RATE_SCALE = 180;
const FLOW_RATE_BASE = 40;
const DENSITY_CRITICAL = 0.9;
const DENSITY_CONGESTED = 0.7;
const WAIT_HIGH_DENSITY_THRESHOLD = 0.7;
const WAIT_HIGH_DENSITY_SCALE = 25;
const WAIT_HIGH_DENSITY_OFFSET = 0.5;
const WAIT_LOW_DENSITY_SCALE = 5;
const WAIT_LOW_DENSITY_OFFSET = 0.2;

export interface GateCrowdData {
  id: string;
  name: string;
  section: string;
  density: number;
  currentCount: number;
  capacity: number;
  waitMinutes: number;
  flowRate: number;
  status: "open" | "congested" | "critical" | "closed";
  trend: "increasing" | "stable" | "decreasing";
}

const BASE_GATES: Omit<
  GateCrowdData,
  "density" | "currentCount" | "waitMinutes" | "flowRate" | "status" | "trend"
>[] = [
  { id: "G-N1", name: "Gate North 1", section: "North Stand", capacity: 3200 },
  { id: "G-N2", name: "Gate North 2", section: "North Stand", capacity: 3200 },
  { id: "G-S1", name: "Gate South 1", section: "South Stand", capacity: 4000 },
  { id: "G-S2", name: "Gate South 2", section: "South Stand", capacity: 4000 },
  { id: "G-E1", name: "Gate East 1", section: "East Stand", capacity: 2800 },
  { id: "G-E2", name: "Gate East 2", section: "East Stand", capacity: 2800 },
  { id: "G-W1", name: "Gate West 1", section: "West Stand", capacity: 5000 },
  { id: "G-W2", name: "Gate West 2", section: "West Stand", capacity: 5000 },
  { id: "G-VIP", name: "VIP Entrance", section: "VIP Lounge", capacity: 800 },
  { id: "G-MEDIA", name: "Media Gate", section: "Press Box", capacity: 600 },
  { id: "G-ACC", name: "Accessibility Gate", section: "All Sections", capacity: 500 },
  { id: "G-STAFF", name: "Staff Entry", section: "Operations", capacity: 1200 },
];

/** Baseline densities per gate — tuned to produce realistic mixed scenarios */
const BASE_DENSITIES = [0.82, 0.65, 0.91, 0.55, 0.48, 0.72, 0.38, 0.61, 0.29, 0.15, 0.44, 0.35] as const;

function computeStatus(density: number): GateCrowdData["status"] {
  if (density >= DENSITY_CRITICAL) return "critical";
  if (density >= DENSITY_CONGESTED) return "congested";
  return "open";
}

function computeTrend(density: number, seed: number): GateCrowdData["trend"] {
  const bucket = seed % 3;
  if (density > 0.75) return bucket === 0 ? "increasing" : "stable";
  if (density < 0.3) return bucket === 0 ? "decreasing" : "stable";
  return (["increasing", "stable", "decreasing"] as const)[bucket] ?? "stable";
}

function computeWaitMinutes(density: number): number {
  if (density > WAIT_HIGH_DENSITY_THRESHOLD) {
    return Math.round((density - WAIT_HIGH_DENSITY_OFFSET) * WAIT_HIGH_DENSITY_SCALE);
  }
  return Math.max(0, Math.round((density - WAIT_LOW_DENSITY_OFFSET) * WAIT_LOW_DENSITY_SCALE));
}

/** Returns simulated live crowd data. Seed rotates every 30 s for realistic drift. */
export function getLiveCrowdData(): GateCrowdData[] {
  const seed = Math.floor(Date.now() / CROWD_WINDOW_MS);

  return BASE_GATES.map((gate, idx) => {
    const base = BASE_DENSITIES[idx] ?? 0.5;
    const jitter = ((seed + idx * 7) % JITTER_RANGE) / 100 - JITTER_OFFSET;
    const density = Math.min(1, Math.max(0, base + jitter));
    const currentCount = Math.round(density * gate.capacity);
    const waitMinutes = computeWaitMinutes(density);
    const flowRate = Math.round(density * FLOW_RATE_SCALE + FLOW_RATE_BASE);

    return {
      ...gate,
      density: Math.round(density * 100) / 100,
      currentCount,
      waitMinutes,
      flowRate,
      status: computeStatus(density),
      trend: computeTrend(density, seed + idx),
    };
  });
}
