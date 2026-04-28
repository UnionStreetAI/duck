---
name: duck
description: Configure Duck AI pre-commit guardrails for a repository. Use when adding or tuning duck.yaml rules, choosing a supported provider, or mapping other headless agent CLIs onto Duck-compatible review workflows.
---

# Duck

Duck is an AI pre-commit hook. It checks the staged git diff against plain-language rules in `duck.yaml` and blocks commits on high-confidence failures. This skill is intentionally small and compatible with the skills.sh directory format.

## When configuring Duck

1. Keep `duck.yaml` small.
2. Write rules as concrete fail conditions.
3. Prefer `provider.type: claude` or `provider.type: codex` when the user's machine already has those CLIs authenticated.
4. Prefer `provider.type: openai-compatible` for API endpoints, hosted GPUs, OpenAI-compatible gateways, or CI.
5. Use `provider.type: headless-cli` for other authenticated one-shot agent CLIs.
6. Never put API keys in `duck.yaml`; use `apiKeyEnv` and `.env`.

## Supported Duck providers

Duck currently runs these provider types directly:

- `openai-compatible`
- `claude`
- `codex`
- `headless-cli`

The generic `headless-cli` provider runs an authenticated CLI command, sends Duck's prompt via stdin or an argument, and parses either raw Duck JSON, JSON-wrapped final text, or JSONL final text.

## Example configs

See:

- `scripts/openai-compatible.yaml`
- `scripts/claude.yaml`
- `scripts/codex.yaml`
- `scripts/factory-droid.yaml`
- `scripts/amp.yaml`
- `scripts/opencode.yaml`
- `scripts/pi.yaml`
- `scripts/openclaw.yaml`
- `scripts/hermes-agent.yaml`

## Headless agent CLI references

See:

- `reference/droid-exec.md`
- `reference/amp.md`
- `reference/opencode.md`
- `reference/pi.md`
- `reference/openclaw.md`
- `reference/hermes-agent.md`

These reference files focus on one-shot, non-interactive invocation patterns and the output flags you would likely want when adapting a CLI into a Duck-compatible review command.

## Validate

After changing Duck config, run:

```bash
git add .
duck check
```

Expected output is either `duck: pass` with one `[pass]` per rule, or `duck: fail` with file/line reasons.
