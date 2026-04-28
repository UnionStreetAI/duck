import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import { z } from "zod";

const ProviderSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("openai-compatible"),
    name: z.string().min(1).default("openai"),
    baseURL: z.string().url().default("https://api.openai.com/v1"),
    apiKeyEnv: z.string().min(1).default("OPENAI_API_KEY"),
    model: z.string().min(1),
  }),
  z.object({
    type: z.literal("claude"),
    model: z.string().min(1).optional(),
    command: z.string().min(1).default("claude"),
  }),
  z.object({
    type: z.literal("codex"),
    model: z.string().min(1).optional(),
    command: z.string().min(1).default("codex"),
    sandbox: z
      .enum(["read-only", "workspace-write", "danger-full-access"])
      .default("read-only"),
  }),
]);

const RuleSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  severity: z.enum(["block", "warn"]).default("block"),
});

export const DuckConfigSchema = z.object({
  provider: ProviderSchema,
  rules: z.array(RuleSchema).min(1),
});

export type DuckConfig = z.infer<typeof DuckConfigSchema>;

const CONFIG_NAMES = ["duck.yaml", "duck.yml"];

export function findConfig(startDir = process.cwd()): string | undefined {
  for (const name of CONFIG_NAMES) {
    const path = resolve(startDir, name);
    if (existsSync(path)) return path;
  }
  return undefined;
}

export function loadConfig(path = findConfig()): DuckConfig {
  if (!path) {
    throw new Error("No duck.yaml found. Run `duck init` first.");
  }

  const raw = readFileSync(path, "utf8");
  const parsed = YAML.parse(raw);
  return DuckConfigSchema.parse(parsed);
}
