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

const BASE_GATES: Omit<GateCrowdData, "density" | "currentCount" | "waitMinutes" | "flowRate" | "status" | "trend">[] = [
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

function computeStatus(density: number): GateCrowdData["status"] {
  if (density >= 0.9) return "critical";
  if (density >= 0.7) return "congested";
  return "open";
}

function computeTrend(density: number, seed: number): GateCrowdData["trend"] {
  const r = (seed % 3);
  if (density > 0.75) return r === 0 ? "increasing" : "stable";
  if (density < 0.3) return r === 0 ? "decreasing" : "stable";
  return ["increasing", "stable", "decreasing"][r] as GateCrowdData["trend"];
}

/** Returns simulated live crowd data with slight randomization */
export function getLiveCrowdData(): GateCrowdData[] {
  const seed = Math.floor(Date.now() / 30000); // changes every 30s

  return BASE_GATES.map((gate, idx) => {
    // Deterministic-ish density per gate based on seed
    const base = [0.82, 0.65, 0.91, 0.55, 0.48, 0.72, 0.38, 0.61, 0.29, 0.15, 0.44, 0.35][idx] ?? 0.5;
    const jitter = ((seed + idx * 7) % 20) / 100 - 0.1; // ±10%
    const density = Math.min(1, Math.max(0, base + jitter));
    const currentCount = Math.round(density * gate.capacity);
    const waitMinutes = density > 0.7 ? Math.round((density - 0.5) * 25) : Math.max(0, Math.round((density - 0.2) * 5));
    const flowRate = Math.round(density * 180 + 40);

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
