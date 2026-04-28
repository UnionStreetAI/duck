# OpenCode

Duck does not currently ship an `opencode` provider, but OpenCode already exposes a first-class non-interactive mode.

Docs:

- https://opencode.ai/docs/cli/

Useful patterns:

```bash
opencode run "Review the staged diff and return only JSON."
```

```bash
opencode run --format json "Review the staged diff and return only JSON."
```

```bash
opencode run --attach http://localhost:4096 --format json "Review the staged diff and return only JSON."
```

Notes:

- `opencode run` is the one-shot command for automation.
- `--format json` returns raw JSON events rather than formatted text.
- `--attach` can reuse a warm `opencode serve` process to avoid cold starts.
- OpenCode also supports custom agents if you want a locked-down review persona for Duck-like checks.

If you wrap OpenCode for Duck, either parse the final JSON event or constrain the prompt so the full response body is valid Duck report JSON.
