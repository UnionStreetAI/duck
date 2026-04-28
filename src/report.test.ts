import { describe, expect, it } from "vitest";
import { formatReport, normalizeReport } from "./report.js";

describe("report", () => {
  it("normalizes findings to fail", () => {
    const report = normalizeReport({
      status: "pass",
      checks: [
        {
          rule: "no-slop",
          prompt: "Fail placeholders.",
          status: "pass",
        },
      ],
      findings: [
        {
          rule: "no-slop",
          reason: "placeholder introduced",
          location: { file: "src/app.ts", line: 12 },
        },
      ],
    });

    expect(report.status).toBe("fail");
    expect(report.checks[0]?.status).toBe("fail");
  });

  it("formats pass/fail output", () => {
    expect(
      formatReport({
        status: "pass",
        checks: [
          {
            rule: "no-slop",
            prompt: "Fail placeholders.",
            status: "pass",
            reason: "No violation found.",
          },
        ],
        findings: [],
      }),
    ).toContain("[pass] no-slop");
    expect(
      formatReport({
        status: "fail",
        checks: [
          {
            rule: "no-slop",
            prompt: "Fail placeholders.",
            status: "fail",
          },
        ],
        findings: [
          {
            rule: "no-slop",
            reason: "placeholder introduced",
            location: { file: "src/app.ts", line: 12 },
          },
        ],
      }),
    ).toContain("src/app.ts:12");
  });
});
