# Amp

Use Duck's generic `headless-cli` provider with `scripts/amp.yaml` to run Amp execute mode. Amp has a solid headless execution mode for one-shot checks.

Docs:

- https://ampcode.com/manual

Useful patterns:

```bash
amp -x "Review the staged diff and return only JSON."
```

```bash
echo "Review these staged changes and return only JSON." | amp -x
```

```bash
amp --execute "Review the staged diff and return only JSON." --stream-json
```

Notes:

- Amp execute mode is `amp -x` / `amp --execute`.
- Redirected stdout also enables execute-style output behavior.
- `--stream-json` gives line-delimited structured events when you need machine parsing.
- For non-interactive environments, authenticate with environment variables rather than relying on the interactive login flow.

If you wrap Amp for Duck, ask for strict JSON with no prose and reject anything outside the expected schema.
