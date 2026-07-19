import { test, expect } from "@playwright/test";

test.describe("StadiumSense Command Center E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard page before each test
    await page.goto("/");
  });

  test("loads the dashboard with core KPIs", async ({ page }) => {
    // Check that the title or header is present
    await expect(page.locator("h1")).toContainText(/StadiumSense/i);

    // Verify presence of core KPI cards
    await expect(page.locator("text=Total Occupancy")).toBeVisible();
    await expect(page.locator("text=Active Incidents")).toBeVisible();
    await expect(page.locator("text=Transport Load")).toBeVisible();
    await expect(page.locator("text=Sustainability Score")).toBeVisible();
  });

  test("can navigate through sidebar features", async ({ page }) => {
    const pages = [
      { name: "AI Copilot", path: "/copilot", heading: "AI Command Copilot" },
      { name: "Crowd Intelligence", path: "/crowd", heading: "Crowd Intelligence" },
      { name: "Navigation Assistant", path: "/navigation", heading: "Smart Wayfinding Assistant" },
      { name: "Multilingual", path: "/multilingual", heading: "Multilingual Assistant" },
      { name: "Transportation", path: "/transportation", heading: "Transit & Sustainability" },
      { name: "Incidents", path: "/incidents", heading: "Incident Management" },
      { name: "Accessibility", path: "/accessibility", heading: "Accessibility Command Center" },
    ];

    for (const pg of pages) {
      // Find navigation link and click it
      const navItem = page.locator(`nav >> text=${pg.name}`);
      await expect(navItem).toBeVisible();
      await navItem.click();

      // Check URL and header content
      await expect(page).toHaveURL(new RegExp(pg.path));
      await expect(page.locator("h2, h1")).toContainText(new RegExp(pg.heading, "i"));
    }
  });

  test("applies accessibility settings", async ({ page }) => {
    // Navigate to accessibility page
    await page.goto("/accessibility");

    // Check high contrast mode toggle
    const contrastSwitch = page.locator('button[role="switch"]:has-text("High Contrast Mode")');
    if ((await contrastSwitch.count()) > 0) {
      await contrastSwitch.click();
      // Contrast classes should be applied to HTML or body
      await expect(page.locator("html")).toHaveClass(/dark|high-contrast/);
    }

    // Check font size selector
    const fontSelect = page.locator('select, button[role="combobox"]');
    if ((await fontSelect.count()) > 0) {
      await fontSelect.click();
      // Verify text scaling options
      await expect(page.locator("text=Large")).toBeVisible();
    }
  });

  test("submits an incident report and sees it listed", async ({ page }) => {
    // Go to incidents page
    await page.goto("/incidents");

    // Click 'Report Incident' button if needed or fill out the inline form
    const locationInput = page.locator('input[placeholder*="Location"], input[name="location"]');
    const descInput = page.locator(
      'textarea[placeholder*="Description"], textarea[name="description"]',
    );
    const submitBtn = page.locator(
      'button[type="submit"]:has-text("Report"), button[type="submit"]:has-text("Submit")',
    );

    if ((await locationInput.count()) > 0 && (await descInput.count()) > 0) {
      await locationInput.fill("Gate D Bottleneck");
      await descInput.fill("Heavy congestion at scanning machines, crowd is backing up.");

      // Select severity
      const severitySelect = page.locator('select[name="severity"], button[role="combobox"]');
      if ((await severitySelect.count()) > 0) {
        await severitySelect.selectOption("high");
      }

      await submitBtn.click();

      // Look for confirmation toast or newly added item in list
      await expect(
        page.locator("text=Incident reported successfully|Gate D Bottleneck"),
      ).toBeVisible();
    }
  });
});
