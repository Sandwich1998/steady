import { chromium, devices } from "playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["Pixel 7"],
});
const page = await context.newPage();

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /progress/i }).click();
  await page.getByText(/your week at a glance/i).waitFor({ state: "visible" });

  await page.getByRole("button", { name: /manage/i }).click();
  await page.getByText(/set up what you want to return to/i).waitFor({ state: "visible" });

  console.log("Smoke test passed.");
} finally {
  await browser.close();
}
