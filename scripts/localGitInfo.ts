import { execSync } from "node:child_process";

function safeGit(cmd: string, fallback = "unknown") {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

export const localGitInfo = {
  sha: safeGit("git rev-parse HEAD"),
  branch: safeGit("git branch --show-current", "main"),
};