# Duck

**AI-powered pre-commit hooks for repo-specific code quality guardrails.**

Duck is a tiny CLI that checks your staged git diff with an OpenAI-compatible model, Claude Code, Codex CLI, or another headless agent CLI before commit. Define the rules you care about in `duck.yaml`, then Duck returns a simple pass/fail report with the exact prompt, reason, and location.

Use Duck as an AI pre-commit hook, a lightweight Husky alternative, or a guardrail for AI coding agents that sometimes add TODOs, fake tests, invented APIs, unrelated rewrites, or other repo-specific slop.

## Why Duck?

- **AI pre-commit hook**: block bad staged changes before they enter git history.
- **Repo-specific rules**: write plain-language prompts in YAML.
- **Flexible providers**: use OpenAI-compatible APIs, `claude -p`, `codex exec`, or generic headless CLIs.
- **Minimal output**: pass/fail, prompt, reason, and file/line. No noisy review essay.
- **Agent guardrails**: catch AI-generated code slop before commit.

## Install

From npm:

```bash
npm install --save-dev @unionstreet/duck
npx duck init
```

From this repo today:

```bash
npm install --save-dev github:UnionStreetAI/duck
npx duck init
```

Duck creates:

- `duck.yaml`
- `.git/hooks/pre-commit`
- `.skills/duck` with a small agent skill and example configs

## Configure

`duck init` creates an OpenAI-compatible default config:

```yaml
provider:
  type: openai-compatible
  name: openai
  baseURL: https://api.openai.com/v1
  apiKeyEnv: OPENAI_API_KEY
  model: gpt-4.1-mini

rules:
  - id: no-agent-slop
    prompt: "Fail if staged changes include TODO placeholders, fake tests, invented APIs, or unrelated rewrites."
```

Add your key to a gitignored `.env` file or export it in your shell:

```bash
OPENAI_API_KEY=...
```

Duck automatically loads `.env` when it runs from the pre-commit hook.

This repo's own `duck.yaml` currently uses Claude Code for local development:

```yaml
provider:
  type: claude
```

## Providers

### OpenAI-compatible API

Use OpenAI, local inference servers, hosted GPUs, or any `/v1/chat/completions` compatible API:

```yaml
provider:
  type: openai-compatible
  name: gemma
  baseURL: https://example.com/v1
  apiKeyEnv: GEMMA_API_KEY
  model: google/gemma-4-31B-it
```

### Claude Code

Duck can call the Claude Code CLI in headless print mode:

```yaml
provider:
  type: claude
  command: claude
```

`model` is optional for Claude Code. If omitted, Duck uses your Claude CLI default. If you set it, use whatever your installed `claude --help` supports, such as a Claude Code alias (`sonnet`) or a full model id.

### Codex CLI

Duck can call Codex non-interactively with a read-only sandbox:

```yaml
provider:
  type: codex
  model: gpt-5.5
  command: codex
  sandbox: read-only
```

### Generic headless CLI

Duck can call any authenticated one-shot CLI that accepts a prompt through stdin or an argument and returns Duck-compatible JSON directly, inside JSON final text, or as JSONL final text:

```yaml
provider:
  type: headless-cli
  name: factory-droid
  command: droid
  args:
    - exec
    - --output-format
    - json
    - --cwd
    - "{cwd}"
  promptMode: stdin
```

Use `{cwd}` in `args` for the current repository path and `{prompt}` when a CLI needs the prompt embedded in a specific argument position. Set `promptMode: argument` to append the prompt when no `{prompt}` placeholder is present.

The bundled skill includes examples for Factory Droid (`droid exec`), Amp, OpenCode, Pi, OpenClaw, and Hermes Agent.

## Run manually

```bash
git add .
npx duck check
```

Example output:

```text
duck: fail

[fail] no-agent-slop
  prompt: Fail if staged changes include TODO placeholders, fake tests, invented APIs, or unrelated rewrites.
  src/payment.ts:12: TODO placeholder and invented payment API.
```

Passing output shows each prompt too:

```text
duck: pass

[pass] no-agent-slop
  prompt: Fail if staged changes include TODO placeholders, fake tests, invented APIs, or unrelated rewrites.
  reason: No violation found.
```

## Commands

```bash
duck init       # create duck.yaml and install the pre-commit hook
duck install    # install the pre-commit hook and .skills/duck
duck check      # check the staged git diff
duck check --json
```

## Agent skill

Duck ships a minimal skills.sh-compatible agent skill at `skills/duck/SKILL.md`. `duck init` and `duck install` copy it into `.skills/duck` so agents can discover how to configure Duck and reference example configs in `.skills/duck/scripts`.

The bundled skill also includes `reference/` notes and `scripts/*.yaml` examples for additional headless agent CLIs such as Factory Droid (`droid exec`), Amp, OpenCode, Pi, OpenClaw, and Hermes Agent.

You can also install only the skill from GitHub with:

```bash
npx skills add UnionStreetAI/duck
```

## Good rule ideas

```yaml
rules:
  - id: no-fake-tests
    prompt: "Fail if tests assert implementation details, contain fake expectations, or do not exercise real behavior."

  - id: no-unrelated-rewrites
    prompt: "Fail if the staged diff rewrites files unrelated to the user's requested change."

  - id: no-secret-leaks
    prompt: "Fail if staged changes appear to include API keys, tokens, passwords, private keys, or credentials."
```

## License

MIT
