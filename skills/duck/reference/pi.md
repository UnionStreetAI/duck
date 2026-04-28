# Pi

Use Duck's generic `headless-cli` provider with `scripts/pi.yaml` to run Pi through print mode.

Source docs:

- https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/README.md
- https://www.npmjs.com/package/@mariozechner/pi-coding-agent

Useful patterns:

```bash
pi --print "Review the staged diff and return only JSON."
```

```bash
pi --print --mode json "Review the staged diff and return only JSON."
```

Notes:

- `pi --print` / `pi -p` is the one-shot mode.
- `--mode json` emits JSONL events.
- Print mode can merge piped stdin with the prompt argument.
- Restrict available tools with `--tools`, `--no-tools`, or `--no-builtin-tools`; for read-only checks, use read-only tools such as `read,grep,find,ls`.
