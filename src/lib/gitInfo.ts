function env(key: string, fallback = "unknown") {
  return process.env[key] ?? fallback;
}

export const gitInfo = {
  tag: env("NEXT_PUBLIC_GIT_TAG", "hfrp"),
  sha: env(
    "NEXT_PUBLIC_GIT_SHA",
    "aebbbc196e478f985f0fcd9f305a4d7d46ff42ca"
  ),
  branch: env("NEXT_PUBLIC_GIT_BRANCH", "main"),
  author: env("NEXT_PUBLIC_GIT_AUTHOR", "danielweickdag"),
  date: env("NEXT_PUBLIC_GIT_DATE", "2026-02-08T06:26:09-06:00"),
};