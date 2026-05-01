import { createHash, randomBytes } from "node:crypto";

import { PrismaClient } from "@prisma/client";
import { chromium, devices } from "playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const prisma = new PrismaClient();
const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["Pixel 7"],
});
const page = await context.newPage();
const sessionToken = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(sessionToken).digest("hex");

try {
  const user = await prisma.user.upsert({
    where: { email: "smoke@steady.local" },
    update: {
      username: "Smoke",
      usernameKey: "smoke",
      emailVerifiedAt: new Date(),
    },
    create: {
      email: "smoke@steady.local",
      username: "Smoke",
      usernameKey: "smoke",
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.session.create({
    data: {
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      userId: user.id,
    },
  });

  await context.addCookies([
    {
      name: "steady_session",
      value: sessionToken,
      url: new URL(baseUrl).origin,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await page.locator("#bottom-nav-progress").click();
  await page.getByText(/What stood out|What mattered most|What to build next/).waitFor({
    state: "visible",
  });

  await page.getByRole("button", { name: /manage/i }).click();
  await page.getByText("Practice system", { exact: true }).waitFor({ state: "visible" });

  console.log("Smoke test passed.");
} finally {
  await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => undefined);
  await prisma.$disconnect();
  await browser.close();
}
