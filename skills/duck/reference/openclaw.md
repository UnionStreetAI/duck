# OpenClaw

Use Duck's generic `headless-cli` provider with `scripts/openclaw.yaml` to run OpenClaw through its agent command.

Docs:

- https://docs.openclaw.ai/tools/agent-send
- https://docs.openclaw.ai/cli/agent

Useful patterns:

```bash
openclaw agent --message "Review the staged diff and return only JSON."
```

```bash
openclaw agent --json --message "Review the staged diff and return only JSON."
```

Notes:

- `openclaw agent --message` is the documented non-interactive send path.
- `--json` returns structured payloads with metadata.
- `--local` can force the embedded runtime.
- Review the installed CLI help for runtime and sandbox settings before enabling it in CI.
