# OpenCode

Use Duck's generic `headless-cli` provider with `scripts/opencode.yaml` to run OpenCode through `opencode run`.

Docs:

- https://opencode.ai/docs/cli/

Useful patterns:

```bash
opencode run "Review the staged diff and return only JSON."
```

```bash
opencode run --format json "Review the staged diff and return only JSON."
```

Notes:

- `opencode run` is the one-shot command for automation.
- `--format json` returns JSON events rather than formatted text.
- `--file` / `-f` can attach files when needed.
- Avoid `--dangerously-skip-permissions` outside disposable sandboxes.
