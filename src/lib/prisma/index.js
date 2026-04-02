import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env/server";

function createAdapterFromDatabaseUrl(databaseUrl) {
  const parsedUrl = new URL(databaseUrl);
  const database = parsedUrl.pathname.replace(/^\//, "");

  if (!database) {
    throw new Error("DATABASE_URL must include a database name.");
  }

  return new PrismaMariaDb({
    host: parsedUrl.hostname,
    port: parsedUrl.port ? Number.parseInt(parsedUrl.port, 10) : 3306,
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database,
    connectionLimit: Number.parseInt(parsedUrl.searchParams.get("connection_limit") || "5", 10),
  });
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: createAdapterFromDatabaseUrl(env.database.url),
  });
}

const globalForPrisma = globalThis;

export function getPrismaClient() {
  if (!globalForPrisma.__equipBlogPrisma) {
    globalForPrisma.__equipBlogPrisma = createPrismaClient();
  }

  return globalForPrisma.__equipBlogPrisma;
}
