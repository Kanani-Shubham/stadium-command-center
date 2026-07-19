import { renderHook, act } from "@testing-library/react";
import { useAccessibilitySettings } from "@/features/accessibility/useAccessibilitySettings";
import { describe, it, expect, beforeEach } from "vitest";

describe("useAccessibilitySettings hook", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-font-size");
    document.documentElement.style.fontSize = "";
  });

  it("loads defaults when localStorage is empty", () => {
    const { result } = renderHook(() => useAccessibilitySettings());
    expect(result.current.highContrast).toBe(false);
    expect(result.current.fontSize).toBe("md");
    expect(result.current.reducedMotion).toBe(false);
  });

  it("toggles highContrast and updates document element", () => {
    const { result } = renderHook(() => useAccessibilitySettings());
    act(() => {
      result.current.setHighContrast(true);
    });
    expect(result.current.highContrast).toBe(true);
    expect(document.documentElement.classList.contains("high-contrast-mode")).toBe(true);
    expect(localStorage.getItem("a11y-high-contrast")).toBe("true");
  });

  it("updates font size and HTML attributes", () => {
    const { result } = renderHook(() => useAccessibilitySettings());
    act(() => {
      result.current.setFontSize("xl");
    });
    expect(result.current.fontSize).toBe("xl");
    expect(document.documentElement.getAttribute("data-font-size")).toBe("xl");
    expect(document.documentElement.style.fontSize).toBe("20px");
    expect(localStorage.getItem("a11y-font-size")).toBe("xl");
  });

  it("toggles reducedMotion and updates document", () => {
    const { result } = renderHook(() => useAccessibilitySettings());
    act(() => {
      result.current.setReducedMotion(true);
    });
    expect(result.current.reducedMotion).toBe(true);
    expect(document.documentElement.classList.contains("reduced-motion-mode")).toBe(true);
    expect(localStorage.getItem("a11y-reduced-motion")).toBe("true");
  });
});
