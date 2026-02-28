import { randomBytes, createHash, createCipheriv, createDecipheriv } from "crypto";

const PREFIX = "lx_";
const ALGO = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) throw new Error("ENCRYPTION_KEY env var is required");
  return createHash("sha256").update(secret).digest();
}

export function generateApiKey(): { key: string; hash: string; prefix: string; encrypted: string } {
  const raw = randomBytes(32).toString("hex");
  const key = `${PREFIX}${raw}`;
  const hash = hashApiKey(key);
  const prefix = key.slice(0, 12);
  const encrypted = encryptApiKey(key);
  return { key, hash, prefix, encrypted };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function encryptApiKey(key: string): string {
  const encKey = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, encKey, iv);
  const encrypted = Buffer.concat([cipher.update(key, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), encrypted.toString("hex"), tag.toString("hex")].join(":");
}

export function decryptApiKey(encryptedStr: string): string {
  const encKey = getEncryptionKey();
  const [ivHex, encHex, tagHex] = encryptedStr.split(":");
  const decipher = createDecipheriv(ALGO, encKey, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
