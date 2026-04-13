import { readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

import { config as loadEnv } from "dotenv";

loadEnv({
  path: ".env",
  override: true,
});

const PRISMA_BIN = join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: process.cwd(),
    input: options.input,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
}

function getMigrationNames() {
  return readdirSync(join(process.cwd(), "prisma", "migrations"), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

run(PRISMA_BIN, ["db", "push", "--force-reset"]);
run(PRISMA_BIN, ["generate"]);
const resetSqlPath = join(tmpdir(), "equip-blog-reset-migrations.sql");
writeFileSync(resetSqlPath, "DROP TABLE IF EXISTS _prisma_migrations;");
run(PRISMA_BIN, ["db", "execute", "--file", resetSqlPath]);
rmSync(resetSqlPath, { force: true });

for (const migrationName of getMigrationNames()) {
  run(PRISMA_BIN, ["migrate", "resolve", "--applied", migrationName]);
}

run(PRISMA_BIN, ["db", "seed"]);
