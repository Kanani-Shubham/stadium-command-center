/**
 * Unit tests for accessibility settings utilities.
 * Run with: pnpm --filter @workspace/stadium-sense run test
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

// ── FontSize validation ───────────────────────────────────────────────────────

type FontSize = "sm" | "md" | "lg" | "xl";

const FONT_SIZES: FontSize[] = ["sm", "md", "lg", "xl"];

const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
};

function isValidFontSize(value: string): value is FontSize {
  return FONT_SIZES.includes(value as FontSize);
}

function readStorageFontSize(stored: string | null): FontSize {
  if (stored && isValidFontSize(stored)) return stored;
  return "md";
}

describe("FONT_SIZES", () => {
  it("contains exactly 4 entries", () => {
    expect(FONT_SIZES).toHaveLength(4);
  });

  it("entries are in ascending pixel order", () => {
    const px = FONT_SIZES.map((s) => parseInt(FONT_SIZE_PX[s]!, 10));
    for (let i = 1; i < px.length; i++) {
      expect(px[i]).toBeGreaterThan(px[i - 1]!);
    }
  });

  it("starts at sm and ends at xl", () => {
    expect(FONT_SIZES[0]).toBe("sm");
    expect(FONT_SIZES[FONT_SIZES.length - 1]).toBe("xl");
  });
});

describe("isValidFontSize", () => {
  it("accepts all four valid sizes", () => {
    for (const size of FONT_SIZES) {
      expect(isValidFontSize(size)).toBe(true);
    }
  });

  it("rejects unknown strings", () => {
    expect(isValidFontSize("xxl")).toBe(false);
    expect(isValidFontSize("")).toBe(false);
    expect(isValidFontSize("16px")).toBe(false);
    expect(isValidFontSize("medium")).toBe(false);
  });
});

describe("FONT_SIZE_PX mapping", () => {
  it("sm maps to 14px", () => expect(FONT_SIZE_PX.sm).toBe("14px"));
  it("md maps to 16px", () => expect(FONT_SIZE_PX.md).toBe("16px"));
  it("lg maps to 18px", () => expect(FONT_SIZE_PX.lg).toBe("18px"));
  it("xl maps to 20px", () => expect(FONT_SIZE_PX.xl).toBe("20px"));
});

describe("readStorageFontSize", () => {
  it("returns stored valid value", () => {
    expect(readStorageFontSize("lg")).toBe("lg");
    expect(readStorageFontSize("xl")).toBe("xl");
  });

  it("returns md for null (no stored value)", () => {
    expect(readStorageFontSize(null)).toBe("md");
  });

  it("returns md for invalid stored value", () => {
    expect(readStorageFontSize("xxl")).toBe("md");
    expect(readStorageFontSize("")).toBe("md");
    expect(readStorageFontSize("16px")).toBe("md");
  });
});

// ── Storage key constants ─────────────────────────────────────────────────────

const STORAGE_KEYS = {
  highContrast: "a11y-high-contrast",
  fontSize: "a11y-font-size",
  reducedMotion: "a11y-reduced-motion",
} as const;

describe("STORAGE_KEYS", () => {
  it("all keys have the a11y- prefix for namespacing", () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(key.startsWith("a11y-")).toBe(true);
    }
  });

  it("has exactly 3 keys", () => {
    expect(Object.keys(STORAGE_KEYS)).toHaveLength(3);
  });

  it("highContrast key is correct", () => {
    expect(STORAGE_KEYS.highContrast).toBe("a11y-high-contrast");
  });

  it("fontSize key is correct", () => {
    expect(STORAGE_KEYS.fontSize).toBe("a11y-font-size");
  });

  it("reducedMotion key is correct", () => {
    expect(STORAGE_KEYS.reducedMotion).toBe("a11y-reduced-motion");
  });
});

// ── Boolean storage helpers ───────────────────────────────────────────────────

function readStorageBool(stored: string | null): boolean {
  return stored === "true";
}

describe("readStorageBool", () => {
  it("returns true only for the string 'true'", () => {
    expect(readStorageBool("true")).toBe(true);
  });

  it("returns false for null", () => {
    expect(readStorageBool(null)).toBe(false);
  });

  it("returns false for 'false'", () => {
    expect(readStorageBool("false")).toBe(false);
  });

  it("returns false for arbitrary strings", () => {
    expect(readStorageBool("yes")).toBe(false);
    expect(readStorageBool("1")).toBe(false);
    expect(readStorageBool("TRUE")).toBe(false);
  });
});

// ── Keyboard shortcut definitions ─────────────────────────────────────────────

const KEYBOARD_SHORTCUTS = [
  { key: "Tab", description: "Move focus to next interactive element" },
  { key: "Shift + Tab", description: "Move focus to previous interactive element" },
  { key: "Enter", description: "Activate focused link or button" },
  { key: "Space", description: "Toggle focused switch or checkbox" },
] as const;

describe("KEYBOARD_SHORTCUTS", () => {
  it("defines at least 4 shortcuts", () => {
    expect(KEYBOARD_SHORTCUTS.length).toBeGreaterThanOrEqual(4);
  });

  it("each shortcut has a key and description", () => {
    for (const shortcut of KEYBOARD_SHORTCUTS) {
      expect(shortcut.key.length).toBeGreaterThan(0);
      expect(shortcut.description.length).toBeGreaterThan(0);
    }
  });

  it("includes Tab navigation", () => {
    const keys = KEYBOARD_SHORTCUTS.map((s) => s.key);
    expect(keys).toContain("Tab");
    expect(keys).toContain("Shift + Tab");
  });
});
