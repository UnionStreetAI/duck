# OpenClaw

Duck does not currently ship an `openclaw` provider, but OpenClaw documents non-interactive CLI automation patterns.

Docs:

- https://docs.openclaw.ai/cli/agent
- https://docs.openclaw.ai/start/wizard-cli-automation

Reference patterns from the docs:

```bash
openclaw agents add work \
  --workspace ~/.openclaw/workspace-work \
  --model openai/gpt-5.5 \
  --bind whatsapp:biz \
  --non-interactive \
  --json
```

Notes:

- The docs explicitly mention `--non-interactive` and `--json` in CLI automation flows.
- OpenClaw’s `agent` command is the likely place to build a future Duck adapter, but exact invocation details should be verified against the installed CLI help before wiring runtime support.
- If you standardize on OpenClaw internally, prefer a tiny wrapper script that hides agent/session setup and only emits Duck report JSON.

Because the hosted docs are heavy and occasionally awkward to scrape, verify the final command shape locally with `openclaw --help` and `openclaw agent --help`.
