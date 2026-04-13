import { execFileSync } from "node:child_process";
import process from "node:process";

import { config as loadEnv } from "dotenv";

loadEnv({
  path: ".env",
  override: false,
});

const ACTIONS = new Set(["deploy", "migrate", "reset"]);
const action = process.argv[2];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readEnv(name, { fallback = "" } = {}) {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function requireEnv(name) {
  const value = readEnv(name);

  if (!value) {
    fail(`${name} is required. Copy .env.template.txt to .env and fill it in.`);
  }

  return value;
}

function toBoolean(value) {
  return /^(1|true|yes)$/i.test(String(value || ""));
}

function quotePosix(value) {
  return `'${String(value).replace(/'/g, `'\"'\"'`)}'`;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.stdio || "pipe",
  });
}

function runStreaming(command, args) {
  execFileSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}

function capture(command, args) {
  return run(command, args).trim();
}

function getGitBranch() {
  const branch = readEnv("CPANEL_GIT_BRANCH") || capture("git", ["branch", "--show-current"]);

  if (!branch) {
    fail("Unable to determine the deployment branch. Set CPANEL_GIT_BRANCH in .env.");
  }

  return branch;
}

function getRepoUrl() {
  return capture("git", ["remote", "get-url", "origin"]);
}

function buildSshArgs() {
  const host = requireEnv("CPANEL_SSH_HOST");
  const user = requireEnv("CPANEL_SSH_USER");
  const port = readEnv("CPANEL_SSH_PORT", { fallback: "22" });
  const keyPath = readEnv("CPANEL_SSH_KEY_PATH");
  const sshArgs = ["-p", port, "-o", "BatchMode=yes"];

  if (keyPath) {
    sshArgs.push("-i", keyPath);
  }

  return {
    sshArgs,
    target: `${user}@${host}`,
  };
}

function runRemoteScript(script) {
  const { sshArgs, target } = buildSshArgs();
  runStreaming("ssh", [...sshArgs, target, `bash -lc ${quotePosix(script)}`]);
}

function getRemotePrelude() {
  const appPath = requireEnv("CPANEL_APP_PATH");

  return `
set -euo pipefail
APP_PATH=${quotePosix(appPath)}
mkdir -p "$APP_PATH"
cd "$APP_PATH"
if [ ! -f .env ]; then
  echo "Missing remote .env at $APP_PATH/.env"
  exit 1
fi
`;
}

function warnIfWorktreeIsDirty() {
  const status = capture("git", ["status", "--short"]);

  if (status) {
    console.warn(
      "Warning: local git worktree is dirty. cPanel deployment will use the latest pushed commit on the selected branch, not uncommitted local changes.",
    );
  }
}

function buildDeployScript() {
  const repoUrl = getRepoUrl();
  const branch = getGitBranch();

  return `
${getRemotePrelude()}
if [ ! -d .git ]; then
  git init
fi
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin ${quotePosix(repoUrl)}
else
  git remote add origin ${quotePosix(repoUrl)}
fi
git fetch --depth=1 origin ${quotePosix(branch)}
git checkout -B ${quotePosix(branch)} FETCH_HEAD
git reset --hard FETCH_HEAD
git clean -fd -e .env -e node_modules -e tmp -e public/uploads
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
mkdir -p tmp
touch tmp/restart.txt
echo "cPanel deployment finished."
`;
}

function buildMigrateScript() {
  return `
${getRemotePrelude()}
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
mkdir -p tmp
touch tmp/restart.txt
echo "cPanel migration and seed finished."
`;
}

function buildResetScript() {
  if (!toBoolean(readEnv("CPANEL_ALLOW_DATA_RESET"))) {
    fail("CPANEL_ALLOW_DATA_RESET=true is required before running a remote reset.");
  }

  return `
${getRemotePrelude()}
node scripts/prisma-reset.mjs
mkdir -p tmp
touch tmp/restart.txt
echo "cPanel reset and reseed finished."
`;
}

if (!ACTIONS.has(action)) {
  fail("Usage: node scripts/cpanel.mjs <deploy|migrate|reset>");
}

if (action === "deploy") {
  warnIfWorktreeIsDirty();
  runRemoteScript(buildDeployScript());
} else if (action === "migrate") {
  runRemoteScript(buildMigrateScript());
} else {
  runRemoteScript(buildResetScript());
}
