import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { plugins } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

type User = Awaited<ReturnType<typeof requireUser>>;

const ALLOWED_CITATION_MODES = ["mandatory", "optional", "none", "off"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let user: User;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const plugin = await db.query.plugins.findFirst({
      where: and(eq(plugins.id, id), eq(plugins.creatorId, user.id)),
      with: { documents: true, decisionTrees: true },
    });
    if (!plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }
    return NextResponse.json(plugin);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let user: User;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const existing = await db.query.plugins.findFirst({
      where: and(eq(plugins.id, id), eq(plugins.creatorId, user.id)),
    });
    if (!existing) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }

    // Field length validation
    if (body.name !== undefined && (typeof body.name !== "string" || body.name.length > 200)) {
      return NextResponse.json({ error: "Name must be a string under 200 characters" }, { status: 400 });
    }
    if (body.domain !== undefined && (typeof body.domain !== "string" || body.domain.length > 200)) {
      return NextResponse.json({ error: "Domain must be a string under 200 characters" }, { status: 400 });
    }
    if (body.systemPrompt !== undefined && (typeof body.systemPrompt !== "string" || body.systemPrompt.length > 10000)) {
      return NextResponse.json({ error: "System prompt must be a string under 10,000 characters" }, { status: 400 });
    }
    if (body.description !== undefined && body.description !== null && (typeof body.description !== "string" || body.description.length > 2000)) {
      return NextResponse.json({ error: "Description must be a string under 2,000 characters" }, { status: 400 });
    }

    // citationMode validation — validate before normalization
    const rawCitationMode = body.citationMode ?? existing.citationMode;
    if (!ALLOWED_CITATION_MODES.includes(rawCitationMode)) {
      return NextResponse.json(
        { error: `Invalid citationMode. Allowed: ${ALLOWED_CITATION_MODES.join(", ")}` },
        { status: 400 },
      );
    }
    const citationMode = rawCitationMode === "off" ? "none" : rawCitationMode;

    const [updated] = await db
      .update(plugins)
      .set({
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        domain: body.domain ?? existing.domain,
        systemPrompt: body.systemPrompt ?? existing.systemPrompt,
        citationMode,
        isPublished: body.isPublished ?? existing.isPublished,
        updatedAt: new Date(),
      })
      .where(and(eq(plugins.id, id), eq(plugins.creatorId, user.id)))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let user: User;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await db.query.plugins.findFirst({
      where: and(eq(plugins.id, id), eq(plugins.creatorId, user.id)),
    });
    if (!existing) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }

    // Include ownership in WHERE to prevent TOCTOU race
    await db.delete(plugins).where(and(eq(plugins.id, id), eq(plugins.creatorId, user.id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
