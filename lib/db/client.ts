/**
 * DATABASE — the PostgreSQL connection. Server-only.
 *
 * CONFIGURATION — one environment variable, never hardcoded and never
 * NEXT_PUBLIC_:
 *   DATABASE_URL   the database's connection string. On Neon or Supabase,
 *                  use the *pooled* one (it can serve many serverless
 *                  functions at once).
 *
 * The schema is db/schema.sql, applied with `npm run db:migrate`.
 *
 * One small pool per server instance, created on first use. Prepared
 * statements are off because pooled connection strings (PgBouncer) don't
 * keep them between queries.
 */

import "server-only";
import postgres from "postgres";

export class DatabaseUnavailable extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "DatabaseUnavailable";
  }
}

let client: postgres.Sql | null = null;

export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** The connection pool. Throws DatabaseUnavailable when it isn't configured. */
export function db(): postgres.Sql {
  if (client) return client;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new DatabaseUnavailable();
  client = postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    onnotice: () => {},
  });
  return client;
}

/** True for Postgres's "duplicate key" error on the named unique index. */
export function isUniqueViolation(error: unknown, index?: string): boolean {
  const e = error as { code?: string; constraint_name?: string };
  return e?.code === "23505" && (!index || e.constraint_name === index);
}
