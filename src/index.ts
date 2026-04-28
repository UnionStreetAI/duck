#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { loadConfig } from "./config.js";
import { runCheck } from "./check.js";
import { formatReport } from "./report.js";
import { git, isGitRepo } from "./git.js";
import { loadDotEnv } from "./env.js";

loadDotEnv();

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_CONFIG = `provider:
  type: openai-compatible
  name: openai
  baseURL: https://api.openai.com/v1
  apiKeyEnv: OPENAI_API_KEY
  model: gpt-4.1-mini

rules:
  - id: no-agent-slop
    prompt: "Fail if staged changes include TODO placeholders, fake tests, invented APIs, or unrelated rewrites."
`;

async function initCommand(): Promise<void> {
  if (!(await isGitRepo())) {
    await git(["init"]);
  }

  const configPath = resolve(process.cwd(), "duck.yaml");
  if (!existsSync(configPath)) {
    writeFileSync(configPath, DEFAULT_CONFIG);
  }

  await installHook();
  console.log("duck: initialized duck.yaml and pre-commit hook");
}

async function installHook(): Promise<void> {
  if (!(await isGitRepo())) {
    throw new Error("Not a git repository. Run `git init` first.");
  }

  const gitDir = (await git(["rev-parse", "--git-dir"])).trim();
  const hooksDir = resolve(process.cwd(), gitDir, "hooks");
  mkdirSync(hooksDir, { recursive: true });

  const hookPath = resolve(hooksDir, "pre-commit");
  writeFileSync(
    hookPath,
    `#!/bin/sh
if [ -f ./dist/index.js ]; then
  node ./dist/index.js check
elif [ -x ./node_modules/.bin/duck ]; then
  ./node_modules/.bin/duck check
elif command -v duck >/dev/null 2>&1; then
  duck check
else
  npx --no-install duck check
fi
`,
    { mode: 0o755 },
  );
  console.log("duck: installed pre-commit hook");
  installSkill();
}

function installSkill(): void {
  const source = resolve(PACKAGE_ROOT, "skills", "duck");
  if (!existsSync(source)) return;

  const target = resolve(process.cwd(), ".skills", "duck");
  mkdirSync(resolve(process.cwd(), ".skills"), { recursive: true });
  cpSync(source, target, { recursive: true, force: true });
  console.log("duck: installed .skills/duck");
}

const program = new Command();

program
  .name("duck")
  .description("AI-powered pre-commit guardrails")
  .version("0.1.0");

program
  .command("init")
  .description("Create duck.yaml and install the pre-commit hook")
  .action(async () => {
    await initCommand();
  });

program
  .command("install")
  .description("Install the Duck pre-commit hook")
  .action(async () => {
    await installHook();
  });

program
  .command("check")
  .description("Check the staged diff against duck.yaml")
  .option("--json", "print structured JSON")
  .option("-c, --config <path>", "path to duck.yaml")
  .action(async options => {
    const config = loadConfig(options.config);
    const report = await runCheck(config);

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatReport(report));
    }

    process.exitCode = report.status === "fail" ? 1 : 0;
  });

program.parseAsync().catch(error => {
  console.error(`duck: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
