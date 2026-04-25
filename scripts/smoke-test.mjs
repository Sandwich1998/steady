import { chromium, devices } from "playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["Pixel 7"],
});
const page = await context.newPage();

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await page.locator("#bottom-nav-progress").click();
  await page.getByText("Strongest signal", { exact: true }).waitFor({ state: "visible" });

  await page.getByRole("button", { name: /manage/i }).click();
  await page.getByText("Practice system", { exact: true }).waitFor({ state: "visible" });

  console.log("Smoke test passed.");
} finally {
  await browser.close();
}
