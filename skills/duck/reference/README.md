# Headless agent CLI references

These files are reference notes for adapting additional agent CLIs into Duck-like review workflows.

Duck runtime support today is limited to:

- `openai-compatible`
- `claude`
- `codex`

The files in this directory document headless invocation patterns for:

- Factory Droid
- Amp
- OpenCode
- Pi
- OpenClaw
- Hermes Agent

Use them when building wrapper scripts, CI jobs, or future provider adapters that must emit Duck’s strict pass/fail JSON contract.
