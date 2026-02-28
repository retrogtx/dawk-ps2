import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

// Optional: set DB_POOL_MAX to tune postgres-js connection concurrency per app instance.
// Example: DB_POOL_MAX=1 (lowest pressure), DB_POOL_MAX=3 (balanced default).
const configuredMax = parsePositiveInt(process.env.DB_POOL_MAX);
const defaultMax = 3;

const queryClient = postgres(process.env.DATABASE_URL!, {
  max: configuredMax ?? defaultMax,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
