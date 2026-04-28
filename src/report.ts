import { z } from "zod";

export const FindingSchema = z.object({
  rule: z.string(),
  reason: z.string(),
  location: z.object({
    file: z.string(),
    line: z.number().int().positive().optional(),
  }),
});

export const RuleCheckSchema = z.object({
  rule: z.string(),
  prompt: z.string(),
  status: z.enum(["pass", "fail"]),
  reason: z.string().optional(),
});

export const ReportSchema = z.object({
  status: z.enum(["pass", "fail"]),
  checks: z.array(RuleCheckSchema).default([]),
  findings: z.array(FindingSchema),
});

export type DuckReport = z.infer<typeof ReportSchema>;

export function normalizeReport(report: DuckReport): DuckReport {
  const checks = report.checks.map(check =>
    report.findings.some(finding => finding.rule === check.rule)
      ? { ...check, status: "fail" as const }
      : check,
  );

  if (report.findings.length > 0) {
    return { ...report, checks, status: "fail" };
  }
  return { status: "pass", checks, findings: [] };
}

export function formatReport(report: DuckReport): string {
  const lines = [report.status === "pass" ? "duck: pass" : "duck: fail"];

  for (const check of report.checks) {
    lines.push("");
    lines.push(`[${check.status}] ${check.rule}`);
    lines.push(`  prompt: ${check.prompt}`);

    const findings = report.findings.filter(finding => finding.rule === check.rule);
    if (findings.length === 0) {
      lines.push(`  reason: ${check.reason ?? "No violation found."}`);
      continue;
    }

    for (const finding of findings) {
      const location =
        finding.location.line === undefined
          ? finding.location.file
          : `${finding.location.file}:${finding.location.line}`;
      lines.push(`  ${location}: ${finding.reason}`);
    }
  }

  return lines.join("\n");
}

