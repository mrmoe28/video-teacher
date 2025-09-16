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
    await expect(page.getByRole('heading', { name: 'AI Analysis' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Smart Transcripts' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Study Groups' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Progress Tracking' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Flashcards' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quizzes & Tests' })).toBeVisible();
  });
});
