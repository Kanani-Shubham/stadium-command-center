# Accessibility

StadiumSense AI targets **WCAG 2.1 Level AA** compliance throughout.

## Implemented Features

### Semantic HTML

- Page regions use `<main>`, `<nav>`, `<section>`, `<article>`, `<header>`
- Lists use `<ul>` / `<ol>` / `<li>` rather than `<div>` chains
- Headings follow a logical `h1 → h2 → h3` hierarchy per page

### ARIA

| Pattern | Implementation |
|---------|---------------|
| Interactive labels | `aria-label` on all icon-only buttons |
| Described-by | `aria-describedby` linking switches to their description text |
| Live regions | `aria-live="assertive"` on error boundary, `aria-busy` on loading states |
| Progress bars | `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Landmark roles | `role="region"` + `aria-label` on all significant content blocks |
| Decorative elements | `aria-hidden="true"` on all decorative icons and SVGs |
| Status messages | `role="alert"` on error and warning alerts |

### Keyboard Navigation

Every interactive element is reachable and operable with keyboard only:

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `Enter` | Activate button / link |
| `Space` | Toggle switch / checkbox |
| `Arrow keys` | Move slider (font size), navigate select |

Focus rings use the browser default (2px outline) enhanced by Tailwind's `focus-visible:` variants, ensuring they only appear for keyboard users.

### User-Controlled Accessibility Settings

The Accessibility Center (`/accessibility`) provides persistent settings stored in `localStorage`:

| Setting | Effect | Storage Key |
|---------|--------|-------------|
| High Contrast | Adds `.high-contrast-mode` class to `<html>` | `a11y-high-contrast` |
| Font Size | Sets `font-size` on `<html>` (14 / 16 / 18 / 20 px) | `a11y-font-size` |
| Reduce Motion | Adds `.reduced-motion-mode` class to `<html>` | `a11y-reduced-motion` |

### Color Contrast

| UI Element | Foreground | Background | Ratio |
|-----------|-----------|-----------|-------|
| Body text | `#1e293b` | `#ffffff` | 14.7:1 ✅ |
| Muted text | `#64748b` | `#ffffff` | 4.7:1 ✅ |
| Primary button | `#ffffff` | `#2563eb` | 4.7:1 ✅ |
| Destructive badge | `#ffffff` | `#dc2626` | 4.6:1 ✅ |
| Amber badge | `#1e293b` | `#f59e0b` | 5.3:1 ✅ |

### Reduced Motion

`.reduced-motion-mode` disables CSS transitions and animations for users who prefer reduced motion. This pairs with the OS-level `prefers-reduced-motion` media query.

### Screen Reader Support

- Gate heatmap cards have `aria-label` summarizing gate name, density, wait time, and status
- Loading states have `aria-busy="true"` with descriptive `aria-label`
- Error boundary announces failures via `role="alert"` + `aria-live="assertive"`
- Copilot chat should be navigable by screen reader via the message list

## Testing Accessibility

Run a quick automated check with the browser's built-in DevTools Accessibility panel, or use:

- [axe DevTools](https://www.deque.com/axe/) browser extension
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) Accessibility audit

For full WCAG 2.1 AA compliance, also perform manual keyboard testing and screen reader testing with NVDA (Windows) or VoiceOver (macOS/iOS).
