import { randomBytes, createHash } from "crypto";

const PREFIX = "lx_";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw = randomBytes(32).toString("hex");
  const key = `${PREFIX}${raw}`;
  const hash = hashApiKey(key);
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
