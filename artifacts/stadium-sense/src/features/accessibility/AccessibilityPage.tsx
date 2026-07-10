import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAccessibilitySettings, type FontSize, FONT_SIZES } from "./useAccessibilitySettings";
import { Slider } from "@/components/ui/slider";
import { Eye, Type, PlaySquare, Keyboard } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AccessibilityPage() {
  const {
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    reducedMotion,
    setReducedMotion,
  } = useAccessibilitySettings();

  const currentFontSizeIndex = FONT_SIZES.indexOf(fontSize);

  const handleSliderChange = (vals: number[]) => {
    const idx = vals[0];
    if (idx !== undefined && idx >= 0 && idx < FONT_SIZES.length) {
      setFontSize(FONT_SIZES[idx] as FontSize);
    }
  };

  return (
    <main className="max-w-3xl mx-auto space-y-6" aria-label="Accessibility settings">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Accessibility Center</h2>
        <p className="text-muted-foreground text-sm">Customize the dashboard experience for your needs.</p>
      </div>

      <div className="grid gap-6">
        {/* Visual Preferences */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
              Visual Preferences
            </CardTitle>
            <CardDescription>Adjust how the application looks to improve readability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1.5">
                <Label htmlFor="high-contrast" className="text-base font-medium">
                  High Contrast Mode
                </Label>
                <p className="text-sm text-muted-foreground" id="high-contrast-description">
                  Increases contrast ratio for better visibility of UI elements and text.
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
                aria-describedby="high-contrast-description"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Label id="font-size-label" className="text-base font-medium">
                    Font Size
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground" id="font-size-description">
                  Scale the application text up or down.
                </p>
              </div>

              <div className="pt-4 px-2">
                <Slider
                  min={0}
                  max={FONT_SIZES.length - 1}
                  step={1}
                  value={[currentFontSizeIndex]}
                  onValueChange={handleSliderChange}
                  aria-labelledby="font-size-label"
                  aria-describedby="font-size-description"
                  aria-valuetext={fontSize}
                />
                <div className="flex justify-between mt-3 text-xs font-medium text-muted-foreground" aria-hidden="true">
                  <span>Small</span>
                  <span>Default</span>
                  <span>Large</span>
                  <span>Extra Large</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border" role="region" aria-label="Font size preview">
                <p className="text-sm font-medium mb-1 text-primary">Preview</p>
                <p>The quick brown fox jumps over the lazy dog. Operators use this view to monitor stadium activity.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motion & Animation */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PlaySquare className="h-5 w-5 text-primary" aria-hidden="true" />
              Motion &amp; Animation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1.5">
                <Label htmlFor="reduced-motion" className="text-base font-medium">
                  Reduce Motion
                </Label>
                <p className="text-sm text-muted-foreground" id="reduced-motion-description">
                  Disables decorative animations and transitions across the interface.
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
                aria-describedby="reduced-motion-description"
              />
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Navigation */}
        <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" aria-hidden="true" />
              Keyboard Navigation Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed mb-4">
              StadiumSense AI is fully optimized for keyboard navigation. Standard ARIA roles are
              implemented across all interactive elements.
            </p>
            <ul className="space-y-2 text-sm" aria-label="Keyboard shortcuts">
              {[
                { key: "Tab", description: "Move focus to next interactive element" },
                { key: "Shift + Tab", description: "Move focus to previous interactive element" },
                { key: "Enter", description: "Activate focused link or button" },
                { key: "Space", description: "Toggle focused switch or checkbox" },
              ].map(({ key, description }) => (
                <li key={key} className="flex gap-3 items-center">
                  <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono shadow-sm">
                    {key}
                  </kbd>
                  {description}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
