import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys, queryLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateApiKey, decryptApiKey } from "@/lib/utils/api-key";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id));
  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { key, hash, prefix, encrypted } = generateApiKey();

    await db.insert(apiKeys).values({
      userId: user.id,
      keyHash: hash,
      keyPrefix: prefix,
      keyEncrypted: encrypted,
      name,
    });

    return NextResponse.json({ key, prefix, name }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
  }

  const key = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.id, id), eq(apiKeys.userId, user.id)),
  });

  if (!key) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  if (!key.keyEncrypted) {
    return NextResponse.json({ error: "Key was created before encryption was enabled" }, { status: 400 });
  }

  const decrypted = decryptApiKey(key.keyEncrypted);
  return NextResponse.json({ key: decrypted });
}

export async function DELETE(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
  }

  const existing = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.id)),
  });

  if (!existing) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  await db
    .update(queryLogs)
    .set({ apiKeyId: null })
    .where(eq(queryLogs.apiKeyId, keyId));

  await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.id)));

  return NextResponse.json({ success: true });
}
