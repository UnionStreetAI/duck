# Hermes Agent

Use Duck's generic `headless-cli` provider with `scripts/hermes-agent.yaml` to run Hermes Agent through `hermes chat --query`.

Docs:

- https://hermes-agent.nousresearch.com/docs/reference/cli-commands

Useful patterns:

```bash
hermes chat --query "Review the staged diff and return only JSON."
```

```bash
hermes chat -q "Review the staged diff and return only JSON."
```

Notes:

- `hermes chat --query` is the documented one-shot, non-interactive path.
- A dedicated JSON output flag for `hermes chat` was not documented; Duck relies on the prompt requiring raw JSON.
- Avoid `--yolo` unless running in an isolated environment.
- Review checkpoint and worktree options for safer automation.
