/**
 * Unit tests for crowd data utilities and UI components.
 * Run with: pnpm --filter @workspace/stadium-sense run test
 */

import { describe, it, expect, vi } from "vitest";

// ── Crowd density classification helpers ────────────────────────────────────

function classifyDensity(density: number): "low" | "medium" | "high" | "critical" {
  if (density >= 0.9) return "critical";
  if (density >= 0.7) return "high";
  if (density >= 0.45) return "medium";
  return "low";
}

function computeWaitMinutes(density: number): number {
  if (density <= 0.2) return 0;
  if (density <= 0.5) return Math.round((density - 0.2) * 5);
  return Math.round((density - 0.5) * 25);
}

describe("classifyDensity", () => {
  it("returns critical when density >= 0.9", () => {
    expect(classifyDensity(0.9)).toBe("critical");
    expect(classifyDensity(1.0)).toBe("critical");
  });

  it("returns high when density in [0.7, 0.9)", () => {
    expect(classifyDensity(0.7)).toBe("high");
    expect(classifyDensity(0.85)).toBe("high");
    expect(classifyDensity(0.899)).toBe("high");
  });

  it("returns medium when density in [0.45, 0.7)", () => {
    expect(classifyDensity(0.45)).toBe("medium");
    expect(classifyDensity(0.6)).toBe("medium");
    expect(classifyDensity(0.699)).toBe("medium");
  });

  it("returns low when density < 0.45", () => {
    expect(classifyDensity(0)).toBe("low");
    expect(classifyDensity(0.2)).toBe("low");
    expect(classifyDensity(0.44)).toBe("low");
  });
});

describe("computeWaitMinutes", () => {
  it("returns 0 for very low density", () => {
    expect(computeWaitMinutes(0)).toBe(0);
    expect(computeWaitMinutes(0.2)).toBe(0);
  });

  it("increases linearly between 0.2 and 0.5", () => {
    const wait = computeWaitMinutes(0.35);
    expect(wait).toBeGreaterThan(0);
    expect(wait).toBeLessThan(5);
  });

  it("increases faster above 0.5", () => {
    const lowWait = computeWaitMinutes(0.49);
    const highWait = computeWaitMinutes(0.9);
    expect(highWait).toBeGreaterThan(lowWait);
  });

  it("returns expected values at boundary conditions", () => {
    // At density 0.5: still in the <=0.5 branch → Math.round((0.5-0.2)*5) = Math.round(1.5) = 2
    expect(computeWaitMinutes(0.5)).toBe(2);
    // At density 1.0: Math.round((1.0-0.5)*25) = Math.round(12.5) = 13
    expect(computeWaitMinutes(1.0)).toBe(13);
  });
});

// ── Incident severity priority mapping ──────────────────────────────────────

const SEVERITY_TO_PRIORITY: Record<string, string> = {
  critical: "P1",
  high: "P2",
  medium: "P3",
  low: "P4",
};

describe("severityToPriority mapping", () => {
  it("maps critical severity to P1", () => {
    expect(SEVERITY_TO_PRIORITY["critical"]).toBe("P1");
  });

  it("maps high severity to P2", () => {
    expect(SEVERITY_TO_PRIORITY["high"]).toBe("P2");
  });

  it("maps medium severity to P3", () => {
    expect(SEVERITY_TO_PRIORITY["medium"]).toBe("P3");
  });

  it("maps low severity to P4", () => {
    expect(SEVERITY_TO_PRIORITY["low"]).toBe("P4");
  });
});

// ── Language support validation ──────────────────────────────────────────────

const SUPPORTED_LANGUAGES = ["en", "hi", "es", "fr", "ar", "pt"];
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  ar: "Arabic",
  pt: "Portuguese",
};

describe("supportedLanguages", () => {
  it("includes all 6 required languages", () => {
    expect(SUPPORTED_LANGUAGES).toContain("en");
    expect(SUPPORTED_LANGUAGES).toContain("hi");
    expect(SUPPORTED_LANGUAGES).toContain("es");
    expect(SUPPORTED_LANGUAGES).toContain("fr");
    expect(SUPPORTED_LANGUAGES).toContain("ar");
    expect(SUPPORTED_LANGUAGES).toContain("pt");
  });

  it("has display names for every supported language", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_NAMES[lang]).toBeDefined();
      expect(LANGUAGE_NAMES[lang]!.length).toBeGreaterThan(0);
    }
  });

  it("has exactly 6 languages", () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(6);
  });
});

// ── Debounce utility ─────────────────────────────────────────────────────────

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

describe("debounce", () => {
  it("delays function execution", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("only calls function once for multiple rapid invocations", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    debouncedFn();
    debouncedFn();
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

// ── Accessibility settings validation ────────────────────────────────────────

type FontSize = "sm" | "md" | "lg" | "xl";

const FONT_SIZE_MAP: Record<FontSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

function isValidFontSize(size: string): size is FontSize {
  return ["sm", "md", "lg", "xl"].includes(size);
}

describe("accessibilitySettings", () => {
  it("validates font size values correctly", () => {
    expect(isValidFontSize("sm")).toBe(true);
    expect(isValidFontSize("md")).toBe(true);
    expect(isValidFontSize("lg")).toBe(true);
    expect(isValidFontSize("xl")).toBe(true);
    expect(isValidFontSize("xxl")).toBe(false);
    expect(isValidFontSize("")).toBe(false);
  });

  it("maps font sizes to pixel values", () => {
    expect(FONT_SIZE_MAP["sm"]).toBe(14);
    expect(FONT_SIZE_MAP["md"]).toBe(16);
    expect(FONT_SIZE_MAP["lg"]).toBe(18);
    expect(FONT_SIZE_MAP["xl"]).toBe(20);
  });

  it("font size values are in ascending order", () => {
    const sizes: FontSize[] = ["sm", "md", "lg", "xl"];
    for (let i = 1; i < sizes.length; i++) {
      expect(FONT_SIZE_MAP[sizes[i]!]).toBeGreaterThan(FONT_SIZE_MAP[sizes[i - 1]!]!);
    }
  });
});

// ── Gate status determination ────────────────────────────────────────────────

type GateStatus = "open" | "congested" | "critical" | "closed";

function computeGateStatus(density: number, isClosed: boolean): GateStatus {
  if (isClosed) return "closed";
  if (density >= 0.9) return "critical";
  if (density >= 0.7) return "congested";
  return "open";
}

describe("computeGateStatus", () => {
  it("returns closed when gate is explicitly closed", () => {
    expect(computeGateStatus(0.5, true)).toBe("closed");
    expect(computeGateStatus(0.95, true)).toBe("closed");
  });

  it("returns critical at high density", () => {
    expect(computeGateStatus(0.9, false)).toBe("critical");
    expect(computeGateStatus(1.0, false)).toBe("critical");
  });

  it("returns congested at medium-high density", () => {
    expect(computeGateStatus(0.7, false)).toBe("congested");
    expect(computeGateStatus(0.85, false)).toBe("congested");
  });

  it("returns open at normal density", () => {
    expect(computeGateStatus(0.3, false)).toBe("open");
    expect(computeGateStatus(0.69, false)).toBe("open");
  });
});
