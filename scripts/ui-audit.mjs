import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = require("axe-core").source;

const baseUrl = process.env.UI_AUDIT_URL ?? "http://localhost:3000";
const outputDir = path.resolve(process.cwd(), "reports", "ui-audit");

const viewports = [
  { name: "iphone-375x812", width: 375, height: 812, isMobile: true },
  { name: "iphone-390x844", width: 390, height: 844, isMobile: true },
  { name: "ipad-768x1024", width: 768, height: 1024, isMobile: false },
  { name: "desktop-1280x900", width: 1280, height: 900, isMobile: false },
];

const scenarios = [
  {
    name: "today-default",
    run: async () => {},
  },
  {
    name: "today-habit-detail",
    run: async (page) => {
      await page.getByRole("button", { name: /details/i }).first().click();
      await page.waitForTimeout(150);
    },
  },
  {
    name: "today-urge-open",
    run: async (page) => {
      await page.getByRole("button", { name: /urge hitting now/i }).first().click();
      await page.waitForTimeout(150);
    },
  },
  {
    name: "progress-tab",
    run: async (page) => {
      await page.getByRole("button", { name: /^Progress/i }).first().click();
      await page.waitForTimeout(150);
    },
  },
  {
    name: "manage-tab",
    run: async (page) => {
      await page.getByRole("button", { name: /^Manage/i }).first().click();
      await page.waitForTimeout(150);
    },
  },
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# UI Audit Summary");
  lines.push("");
  lines.push(`Base URL: \`${report.baseUrl}\``);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push(`- Viewports tested: ${report.summary.viewportsTested}`);
  lines.push(`- Scenarios tested: ${report.summary.scenariosTested}`);
  lines.push(`- Interactive target failures: ${report.summary.interactiveTargetFailures}`);
  lines.push(`- Small text warnings: ${report.summary.smallTextWarnings}`);
  lines.push(`- Low-contrast warnings: ${report.summary.lowContrastWarnings}`);
  lines.push(`- Overflow findings: ${report.summary.overflowFindings}`);
  lines.push(`- Axe violations: ${report.summary.axeViolations}`);
  lines.push("");
  lines.push("## Per Scenario");
  lines.push("");

  for (const viewport of report.results) {
    lines.push(`### ${viewport.viewport.name}`);
    lines.push("");

    for (const scenario of viewport.scenarios) {
      lines.push(`#### ${scenario.name}`);
      lines.push("");
      lines.push(`- Interactive target failures: ${scenario.interactiveTargetFailures.length}`);
      lines.push(`- Small text warnings: ${scenario.smallTextWarnings.length}`);
      lines.push(`- Low-contrast warnings: ${scenario.lowContrastWarnings.length}`);
      lines.push(`- Horizontal overflow: ${scenario.overflow.hasOverflow ? "Yes" : "No"}`);
      lines.push(`- Axe violations: ${scenario.axe.violations.length}`);

      if (scenario.interactiveTargetFailures.length > 0) {
        lines.push("");
        lines.push("Interactive target failures:");
        for (const issue of scenario.interactiveTargetFailures.slice(0, 10)) {
          lines.push(
            `- ${issue.label} at ${issue.selector}: ${issue.width}x${issue.height}px`,
          );
        }
      }

      if (scenario.smallTextWarnings.length > 0) {
        lines.push("");
        lines.push("Small text warnings:");
        for (const issue of scenario.smallTextWarnings.slice(0, 10)) {
          lines.push(`- ${issue.text} at ${issue.selector}: ${issue.fontSize}px`);
        }
      }

      if (scenario.lowContrastWarnings.length > 0) {
        lines.push("");
        lines.push("Low-contrast warnings:");
        for (const issue of scenario.lowContrastWarnings.slice(0, 10)) {
          lines.push(
            `- ${issue.text} at ${issue.selector}: contrast ${issue.contrastRatio}:1`,
          );
        }
      }

      if (scenario.overflow.hasOverflow || scenario.overflow.offenders.length > 0) {
        lines.push("");
        lines.push("Overflow findings:");
        lines.push(
          `- Document width ${scenario.overflow.scrollWidth}px on viewport ${scenario.overflow.clientWidth}px`,
        );
        for (const issue of scenario.overflow.offenders.slice(0, 10)) {
          lines.push(
            `- ${issue.selector}: left ${issue.left}px, right ${issue.right}px, width ${issue.width}px`,
          );
        }
      }

      if (scenario.axe.violations.length > 0) {
        lines.push("");
        lines.push("Axe violations:");
        for (const violation of scenario.axe.violations.slice(0, 10)) {
          lines.push(`- ${violation.id}: ${violation.help}`);
        }
      }

      lines.push("");
    }
  }

  return lines.join("\n");
}

async function ensureOutputDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function auditScenario(page, viewport, scenario) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await scenario.run(page);

  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"],
      },
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    return {
      violations: result.violations.map((violation) => ({
        id: violation.id,
        help: violation.help,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.target.join(" ")),
      })),
    };
  });

  const domAudit = await page.evaluate(() => {
    function isVisible(element) {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number.parseFloat(style.opacity) !== 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    }

    function toRgbArray(value) {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
      return {
        r: parts[0],
        g: parts[1],
        b: parts[2],
        a: parts.length > 3 ? parts[3] : 1,
      };
    }

    function blend(foreground, background) {
      if (!foreground) return background;
      if (!background) return foreground;
      const alpha = foreground.a ?? 1;
      return {
        r: foreground.r * alpha + background.r * (1 - alpha),
        g: foreground.g * alpha + background.g * (1 - alpha),
        b: foreground.b * alpha + background.b * (1 - alpha),
        a: 1,
      };
    }

    function relativeLuminance({ r, g, b }) {
      const values = [r, g, b].map((channel) => {
        const scaled = channel / 255;
        return scaled <= 0.03928
          ? scaled / 12.92
          : ((scaled + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    }

    function contrastRatio(foreground, background) {
      const fg = relativeLuminance(foreground);
      const bg = relativeLuminance(background);
      const light = Math.max(fg, bg);
      const dark = Math.min(fg, bg);
      return Number((((light + 0.05) / (dark + 0.05)) * 100).toFixed(0)) / 100;
    }

    function getBackgroundColor(element) {
      let current = element;
      let background = { r: 17, g: 17, b: 17, a: 1 };

      while (current) {
        const color = toRgbArray(window.getComputedStyle(current).backgroundColor);
        if (color && (color.a ?? 1) > 0) {
          background = blend(color, background);
          if ((color.a ?? 1) >= 1) {
            break;
          }
        }
        current = current.parentElement;
      }

      return background;
    }

    function selectorFor(element) {
      if (element.id) return `#${element.id}`;
      const parts = [];
      let current = element;

      while (current && current !== document.body && parts.length < 4) {
        let part = current.tagName.toLowerCase();
        if (current.classList.length > 0) {
          part += `.${[...current.classList].slice(0, 2).join(".")}`;
        }
        const parent = current.parentElement;
        if (parent) {
          const siblings = [...parent.children].filter(
            (child) => child.tagName === current.tagName,
          );
          if (siblings.length > 1) {
            part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
          }
        }
        parts.unshift(part);
        current = current.parentElement;
      }

      return parts.join(" > ");
    }

    function textLabel(element) {
      return (
        element.getAttribute("aria-label") ||
        element.innerText ||
        element.textContent ||
        element.getAttribute("placeholder") ||
        element.tagName.toLowerCase()
      )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 100);
    }

    const interactiveSelectors = [
      "button",
      "a[href]",
      "input",
      "select",
      "textarea",
      "[role=button]",
      "[role=tab]",
      "[role=link]",
    ];

    const interactiveElements = [
      ...new Set(
        [...document.querySelectorAll(interactiveSelectors.join(","))].filter((element) =>
          isVisible(element),
        ),
      ),
    ];

    const interactiveTargetFailures = interactiveElements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          selector: selectorFor(element),
          label: textLabel(element),
          width: Number(rect.width.toFixed(1)),
          height: Number(rect.height.toFixed(1)),
        };
      })
      .filter((issue) => issue.width < 44 || issue.height < 44);

    const textElements = [...document.querySelectorAll("body *")].filter((element) => {
      if (!isVisible(element)) return false;
      if (!element.textContent || !element.textContent.trim()) return false;
      return [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      );
    });

    const textSnapshots = textElements.map((element) => {
      const style = window.getComputedStyle(element);
      const fontSize = Number.parseFloat(style.fontSize);
      const color = toRgbArray(style.color);
      const background = getBackgroundColor(element);
      const ratio = color ? contrastRatio(blend(color, background), background) : null;

      return {
        selector: selectorFor(element),
        text: textLabel(element),
        fontSize,
        contrastRatio: ratio,
      };
    });

    const smallTextWarnings = textSnapshots.filter((item) => item.fontSize < 11);
    const lowContrastWarnings = textSnapshots.filter(
      (item) => item.contrastRatio !== null && item.contrastRatio < 4.5,
    );

    const overflowOffenders = [...document.querySelectorAll("body *")]
      .filter((element) => isVisible(element))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          selector: selectorFor(element),
          left: Number(rect.left.toFixed(1)),
          right: Number(rect.right.toFixed(1)),
          width: Number(rect.width.toFixed(1)),
        };
      })
      .filter((item) => item.left < -0.5 || item.right > window.innerWidth + 0.5);

    return {
      interactiveTargetFailures,
      smallTextWarnings,
      lowContrastWarnings,
      overflow: {
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: window.innerWidth,
        offenders: overflowOffenders,
      },
    };
  });

  const screenshotPath = path.join(
    outputDir,
    `${slugify(viewport.name)}-${slugify(scenario.name)}.png`,
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });

  return {
    name: scenario.name,
    screenshotPath,
    ...domAudit,
    axe,
  };
}

async function main() {
  await ensureOutputDir();
  const browser = await chromium.launch({ headless: true });

  try {
    const results = [];

    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.isMobile ? 3 : 1,
        isMobile: viewport.isMobile,
        hasTouch: viewport.isMobile,
      });
      const page = await context.newPage();
      const scenarioResults = [];

      for (const scenario of scenarios) {
        scenarioResults.push(await auditScenario(page, viewport, scenario));
      }

      await context.close();
      results.push({
        viewport,
        scenarios: scenarioResults,
      });
    }

    const summary = results.reduce(
      (accumulator, viewport) => {
        accumulator.viewportsTested += 1;
        for (const scenario of viewport.scenarios) {
          accumulator.scenariosTested += 1;
          accumulator.interactiveTargetFailures += scenario.interactiveTargetFailures.length;
          accumulator.smallTextWarnings += scenario.smallTextWarnings.length;
          accumulator.lowContrastWarnings += scenario.lowContrastWarnings.length;
          accumulator.overflowFindings +=
            Number(scenario.overflow.hasOverflow) + scenario.overflow.offenders.length;
          accumulator.axeViolations += scenario.axe.violations.length;
        }
        return accumulator;
      },
      {
        viewportsTested: 0,
        scenariosTested: 0,
        interactiveTargetFailures: 0,
        smallTextWarnings: 0,
        lowContrastWarnings: 0,
        overflowFindings: 0,
        axeViolations: 0,
      },
    );

    const report = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      summary,
      results,
    };

    const jsonPath = path.join(outputDir, "ui-audit-report.json");
    const markdownPath = path.join(outputDir, "ui-audit-summary.md");
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    await fs.writeFile(markdownPath, buildMarkdown(report));

    console.log(`JSON report: ${jsonPath}`);
    console.log(`Markdown summary: ${markdownPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
