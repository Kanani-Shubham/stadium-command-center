import { useEffect, useState } from "react";

export type FontSize = "sm" | "md" | "lg" | "xl";

export const FONT_SIZES: FontSize[] = ["sm", "md", "lg", "xl"];

const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
};

const STORAGE_KEYS = {
  highContrast: "a11y-high-contrast",
  fontSize: "a11y-font-size",
  reducedMotion: "a11y-reduced-motion",
} as const;

function readStorageBool(key: string): boolean {
  return localStorage.getItem(key) === "true";
}

function readStorageFontSize(): FontSize {
  const stored = localStorage.getItem(STORAGE_KEYS.fontSize);
  return FONT_SIZES.includes(stored as FontSize) ? (stored as FontSize) : "md";
}

/**
 * Manages persistent accessibility preferences stored in localStorage and
 * applied to the document root for CSS-driven theming.
 */
export function useAccessibilitySettings() {
  const [highContrast, setHighContrast] = useState(() => readStorageBool(STORAGE_KEYS.highContrast));
  const [fontSize, setFontSize] = useState<FontSize>(readStorageFontSize);
  const [reducedMotion, setReducedMotion] = useState(() => readStorageBool(STORAGE_KEYS.reducedMotion));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.highContrast, String(highContrast));
    document.documentElement.classList.toggle("high-contrast-mode", highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fontSize, fontSize);
    document.documentElement.setAttribute("data-font-size", fontSize);
    document.documentElement.style.fontSize = FONT_SIZE_PX[fontSize];
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.reducedMotion, String(reducedMotion));
    document.documentElement.classList.toggle("reduced-motion-mode", reducedMotion);
  }, [reducedMotion]);

  return { highContrast, setHighContrast, fontSize, setFontSize, reducedMotion, setReducedMotion };
}
