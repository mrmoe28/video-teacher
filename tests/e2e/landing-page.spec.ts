import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("has brand and nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("VideoTeacher")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });

  test("shows hero CTA buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Start Learning Now/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Watch Demo/i })).toBeVisible();
  });

  test("renders feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/AI Analysis/i)).toBeVisible();
    await expect(page.getByText(/Smart Transcripts/i)).toBeVisible();
  });
});
