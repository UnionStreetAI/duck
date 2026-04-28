import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { generateText, stepCountIs, tool } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";
import type { DuckConfig } from "./config.js";
import { getStagedDiff, getStagedFiles, isGitRepo } from "./git.js";
import { normalizeReport, ReportSchema, type DuckReport } from "./report.js";

type CheckOptions = {
  cwd?: string;
};

const ReportInputSchema = z.object({
  status: z.enum(["pass", "fail"]),
  checks: z.array(
    z.object({
      rule: z.string(),
      prompt: z.string(),
      status: z.enum(["pass", "fail"]),
      reason: z.string().optional(),
    }),
  ),
  findings: z.array(
    z.object({
      rule: z.string(),
      reason: z.string(),
      location: z.object({
        file: z.string(),
        line: z.number().int().positive().optional(),
      }),
    }),
  ),
});

export async function runCheck(
  config: DuckConfig,
  options: CheckOptions = {},
): Promise<DuckReport> {
  const cwd = options.cwd ?? process.cwd();
  if (!(await isGitRepo(cwd))) {
    throw new Error("Duck must run inside a git repository.");
  }

  const [diff, files] = await Promise.all([
    getStagedDiff(cwd),
    getStagedFiles(cwd),
  ]);

  if (!diff.trim()) {
    return {
      status: "pass",
      checks: config.rules.map(rule => ({
        rule: rule.id,
        prompt: rule.prompt,
        status: "pass",
        reason: "No staged diff.",
      })),
      findings: [],
    };
  }

  return normalizeReport(ReportSchema.parse(await runProvider(config, cwd, diff, files)));
}

async function runProvider(
  config: DuckConfig,
  cwd: string,
  diff: string,
  files: string[],
): Promise<unknown> {
  const prompt = buildPrompt(config, files, diff);

  if (config.provider.type === "openai-compatible") {
    return runOpenAICompatibleProvider(config.provider, cwd, prompt);
  }

  if (config.provider.type === "claude") {
    const args = ["-p", "--output-format", "json"];
    if (config.provider.model) args.push("--model", config.provider.model);
    const stdout = await execCli(config.provider.command, args, cwd, prompt);
    const result = JSON.parse(stdout) as { result?: unknown };
    return parseJsonResult(result.result);
  }

  if (config.provider.type === "codex") {
    const args = ["exec", "--sandbox", config.provider.sandbox, "--cd", cwd];
    if (config.provider.model) args.push("--model", config.provider.model);
    args.push("-");

    return parseJsonResult(await execCli(config.provider.command, args, cwd, prompt));
  }

  const args = expandCliArgs(config.provider.args, cwd, prompt);
  const hasPromptPlaceholder = config.provider.args.some(arg => arg.includes("{prompt}"));
  const finalArgs =
    config.provider.promptMode === "argument" && !hasPromptPlaceholder
      ? [...args, prompt]
      : args;
  const stdin = config.provider.promptMode === "stdin" ? prompt : "";
  return parseJsonResult(await execCli(config.provider.command, finalArgs, cwd, stdin));
}

async function runOpenAICompatibleProvider(
  providerConfig: Extract<DuckConfig["provider"], { type: "openai-compatible" }>,
  cwd: string,
  prompt: string,
): Promise<unknown> {
  const apiKey = process.env[providerConfig.apiKeyEnv];
  if (!apiKey) {
    throw new Error(
      `No provider credentials found. Set ${providerConfig.apiKeyEnv} in your environment or .env file.`,
    );
  }

  let report: DuckReport | undefined;
  const provider = createOpenAICompatible({
    name: providerConfig.name,
    baseURL: providerConfig.baseURL,
    apiKey,
  });

  await generateText({
    model: provider(providerConfig.model),
    system: buildSystemPrompt(),
    prompt,
    tools: {
      read_file: tool({
        description:
          "Read a file from the current repository if more context is required.",
        inputSchema: z.object({ path: z.string() }),
        execute: async ({ path }) => {
          const root = resolve(cwd);
          const filePath = resolve(cwd, path);
          if (!filePath.startsWith(root)) {
            throw new Error("Refusing to read outside the repository.");
          }
          return readFile(filePath, "utf8");
        },
      }),
      report: tool({
        description:
          "Return Duck's pass/fail result. Use fail only for configured rule violations.",
        inputSchema: ReportInputSchema,
        execute: async input => {
          report = normalizeReport(ReportSchema.parse(input));
          return { received: true };
        },
      }),
    },
    stopWhen: stepCountIs(4),
  });

  if (!report) {
    throw new Error("Model did not call the report tool.");
  }

  return report;
}

async function execCli(
  command: string,
  args: string[],
  cwd: string,
  input: string,
): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on("data", chunk => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", chunk => stderr.push(Buffer.from(chunk)));
    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) {
        resolvePromise(Buffer.concat(stdout).toString("utf8"));
        return;
      }
      reject(
        new Error(
          `${command} exited with code ${code}: ${Buffer.concat(stderr).toString("utf8")}`,
        ),
      );
    });

    child.stdin.end(input);
  });
}

function buildPrompt(config: DuckConfig, files: string[], diff: string): string {
  return [
    buildSystemPrompt(),
    "Return only JSON matching this TypeScript shape:",
    '{ "status": "pass" | "fail", "checks": [{ "rule": string, "prompt": string, "status": "pass" | "fail", "reason"?: string }], "findings": [{ "rule": string, "reason": string, "location": { "file": string, "line"?: number } }] }',
    "Return one check for every configured rule, including the original rule prompt.",
    "Use fail only for high-confidence violations.",
    "",
    JSON.stringify({ rules: config.rules, stagedFiles: files, stagedDiff: diff }, null, 2),
  ].join("\n");
}

function buildSystemPrompt(): string {
  return [
    "You are Duck, a pre-commit guardrail.",
    "Evaluate only whether the staged diff violates the configured rules.",
    "Do not prescribe fixes or improvements.",
    "Report only high-confidence failures with a concise reason and file/line when possible.",
  ].join("\n");
}

function parseJsonResult(value: unknown): unknown {
  if (typeof value !== "string") {
    const parsedReport = ReportSchema.safeParse(value);
    if (parsedReport.success) return parsedReport.data;

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      for (const key of ["result", "finalText", "text", "content", "message", "output"]) {
        if (typeof record[key] === "string") return parseJsonResult(record[key]);
      }
    }

    return value;
  }

  const trimmed = value.trim();
  if (trimmed.includes("\n")) {
    const parsedLines = trimmed
      .split(/\r?\n/)
      .map(line => {
        try {
          return JSON.parse(line) as unknown;
        } catch {
          return undefined;
        }
      })
      .filter(value => value !== undefined);
    for (const line of parsedLines.reverse()) {
      const parsed = parseJsonResult(line);
      if (ReportSchema.safeParse(parsed).success) return parsed;
    }
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return JSON.parse(fenced?.[1] ?? trimmed);
}

function expandCliArgs(args: string[], cwd: string, prompt: string): string[] {
  return args.map(arg => arg.replaceAll("{cwd}", cwd).replaceAll("{prompt}", prompt));
}
