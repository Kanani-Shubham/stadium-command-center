import { useEffect, useState } from "react";

export function useAccessibilitySettings() {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("a11y-high-contrast") === "true";
  });
  
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">(() => {
    return (localStorage.getItem("a11y-font-size") as any) || "md";
  });
  
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem("a11y-reduced-motion") === "true";
  });

  useEffect(() => {
    localStorage.setItem("a11y-high-contrast", String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add("high-contrast-mode");
    } else {
      document.documentElement.classList.remove("high-contrast-mode");
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem("a11y-font-size", fontSize);
    document.documentElement.setAttribute("data-font-size", fontSize);
    
    // Apply to html element style for rem scaling
    const root = document.documentElement;
    if (fontSize === "sm") root.style.fontSize = "14px";
    if (fontSize === "md") root.style.fontSize = "16px";
    if (fontSize === "lg") root.style.fontSize = "18px";
    if (fontSize === "xl") root.style.fontSize = "20px";
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("a11y-reduced-motion", String(reducedMotion));
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion-mode");
    } else {
      document.documentElement.classList.remove("reduced-motion-mode");
    }
  }, [reducedMotion]);

  return {
    highContrast, setHighContrast,
    fontSize, setFontSize,
    reducedMotion, setReducedMotion
  };
}
