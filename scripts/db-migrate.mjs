// Applies db/schema.sql to the database in DATABASE_URL.
//
//   npm run db:migrate
//
// Reads DATABASE_URL the way Next.js does (.env.local, then the shell), so
// the same command works locally and, with the production URL in the shell,
// against the live database. Safe to run again: the schema only creates
// what's missing.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextEnv from "@next/env";
import postgres from "postgres";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
nextEnv.loadEnvConfig(root);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local (see .env.local.example).");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
try {
  const schema = await readFile(path.join(root, "db", "schema.sql"), "utf8");
  await sql.unsafe(schema);
  const [{ count }] = await sql`select count(*)::int as count from users`;
  console.log(`Database is up to date. Members: ${count}.`);
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
