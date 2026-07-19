import { useEffect, useState } from "react";

/**
 * Font size preference classes mapping to specific standard typography sizes
 */
export type FontSize = "sm" | "md" | "lg" | "xl";

/**
 * Ordered list of available font sizes for standard preference selection
 */
export const FONT_SIZES: FontSize[] = ["sm", "md", "lg", "xl"];

/**
 * Pixel value mapping for CSS root font scaling
 */
const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
};

/**
 * LocalStorage keys for saving accessibility preferences
 */
const STORAGE_KEYS = {
  highContrast: "a11y-high-contrast",
  fontSize: "a11y-font-size",
  reducedMotion: "a11y-reduced-motion",
} as const;

/**
 * Reads a boolean accessibility preference from localStorage.
 * @param key - The localStorage lookup key
 * @returns The boolean state flag
 */
function readStorageBool(key: string): boolean {
  return localStorage.getItem(key) === "true";
}

/**
 * Reads the font size preference from localStorage, falling back to medium.
 * @returns The active FontSize configuration
 */
function readStorageFontSize(): FontSize {
  const stored = localStorage.getItem(STORAGE_KEYS.fontSize);
  return FONT_SIZES.includes(stored as FontSize) ? (stored as FontSize) : "md";
}

/**
 * React hook to manage, persist, and apply WCAG 2.1 Level AA compliance options.
 * Synchronizes client preferences (High Contrast, Custom Font Size, Reduced Motion)
 * with both localStorage and CSS variables/classes on the document root element.
 * 
 * @returns An object containing preferences states and setters:
 * - highContrast: High contrast state flag (boolean)
 * - setHighContrast: Dispatcher to toggle high contrast mode
 * - fontSize: Active typography scale class (FontSize)
 * - setFontSize: Dispatcher to update active font size preference
 * - reducedMotion: Reduced motion state flag (boolean)
 * - setReducedMotion: Dispatcher to toggle animation/transition reduction
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
