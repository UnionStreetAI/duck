import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function git(args: string[], cwd = process.cwd()): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    maxBuffer: 20 * 1024 * 1024,
  });
  return stdout;
}

export async function isGitRepo(cwd = process.cwd()): Promise<boolean> {
  try {
    await git(["rev-parse", "--is-inside-work-tree"], cwd);
    return true;
  } catch {
    return false;
  }
}

export async function getStagedDiff(cwd = process.cwd()): Promise<string> {
  return git(["diff", "--cached", "--unified=80", "--no-ext-diff"], cwd);
}

export async function getStagedFiles(cwd = process.cwd()): Promise<string[]> {
  const output = await git(["diff", "--cached", "--name-only"], cwd);
  return output
    .split("\n")
    .map(file => file.trim())
    .filter(Boolean);
}
