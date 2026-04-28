# Factory Droid (`droid exec`)

Use Duck's generic `headless-cli` provider with `scripts/factory-droid.yaml` to run Factory Droid through `droid exec`. Factory Droid supports one-shot execution and structured output.

Docs:

- https://docs.factory.ai/cli/droid-exec/overview.md

Useful patterns:

```bash
droid exec "Review the staged diff and return only JSON." --output-format json
```

```bash
droid exec --auto low --cwd . -f prompt.md --output-format json
```

Notes:

- `droid exec` is non-interactive and exits after one run.
- Default mode is read-only; add `--auto low|medium|high` only when needed.
- `--output-format json` is the simplest machine-readable mode.
- `--output-format stream-json` is useful if you want event streams instead of a single final result.
- `--cwd` is useful in monorepos or CI.

If you wrap `droid exec` for Duck, prompt it to emit the Duck report schema exactly and fail hard on malformed JSON.
