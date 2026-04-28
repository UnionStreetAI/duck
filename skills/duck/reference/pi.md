# Pi

Duck does not currently ship a `pi` provider. Pi support is included here as a reference target only because the CLI ecosystem around “Pi” is less standardized than Claude, Codex, Droid, Amp, or OpenCode.

Starting points:

- https://github.com/badlogic/pi-mono
- https://www.npmjs.com/package/@mariozechner/pi-coding-agent

Suggested approach:

1. Confirm which Pi CLI your team actually uses.
2. Find its one-shot or query mode.
3. Verify whether it can print machine-readable JSON.
4. Add a thin wrapper that normalizes output to Duck’s report schema.

Things to look for in the chosen CLI:

- a non-interactive prompt flag
- stdin support
- JSON or JSONL output
- a way to pin model/provider
- a way to constrain tool permissions

Because “Pi” is ambiguous today, treat this file as a checklist rather than a canonical invocation recipe.
