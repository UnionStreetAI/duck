import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("loads a minimal duck config", () => {
    const dir = mkdtempSync(join(tmpdir(), "duck-"));
    const path = join(dir, "duck.yaml");
    writeFileSync(
      path,
      `provider:
  type: openai-compatible
  name: test
  baseURL: https://example.com/v1
  apiKeyEnv: TEST_API_KEY
  model: test-model
rules:
  - id: no-test
    prompt: "Fail test changes."
`,
    );

    const config = loadConfig(path);
    expect(config.provider.type).toBe("openai-compatible");
    expect(config.provider.model).toBe("test-model");
    expect(config.rules[0]?.severity).toBe("block");
  });

  it("loads headless cli providers", () => {
    const dir = mkdtempSync(join(tmpdir(), "duck-"));
    const path = join(dir, "duck.yaml");
    writeFileSync(
      path,
      `provider:
  type: codex
  model: gpt-5.5
  sandbox: read-only
rules:
  - id: no-test
    prompt: "Fail test changes."
`,
    );

    const config = loadConfig(path);
    expect(config.provider.type).toBe("codex");
    expect(config.provider.command).toBe("codex");
    expect(config.provider.sandbox).toBe("read-only");
  });
});
