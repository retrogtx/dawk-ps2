import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashApiKey } from "@/lib/utils/api-key";
import { runQueryPipeline } from "@/lib/engine/query-pipeline";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate via API key
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }

    const key = authHeader.slice(7);
    const keyHash = hashApiKey(key);

    const apiKey = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.keyHash, keyHash),
    });

    if (!apiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Update last used
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    // 2. Parse body
    const body = await req.json();
    const { plugin, query } = body;

    if (!plugin || !query) {
      return NextResponse.json(
        { error: "Missing required fields: plugin, query" },
        { status: 400 },
      );
    }

    // 3. Run pipeline
    const result = await runQueryPipeline(plugin, query, apiKey.id);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
