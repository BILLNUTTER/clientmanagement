import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { logger } from "./logger";

let _db: ReturnType<typeof drizzle> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

export function initDb(): void {
  if (_db) return;
  const url = process.env["POSTGRES_URL"];
  if (!url) throw new Error("POSTGRES_URL environment variable is required");
  _sql = postgres(url, { max: 10, idle_timeout: 20, connect_timeout: 10 });
  _db = drizzle(_sql);
  logger.info("PostgreSQL (Supabase) client initialized");
}

export function getDb(): ReturnType<typeof drizzle> {
  if (!_db) initDb();
  return _db!;
}
