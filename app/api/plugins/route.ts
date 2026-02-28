import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { plugins } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const ALLOWED_CITATION_MODES = ["mandatory", "optional", "none", "off"];

export async function GET() {
  try {
    const user = await requireUser();
    const userPlugins = await db
      .select()
      .from(plugins)
      .where(eq(plugins.creatorId, user.id))
      .orderBy(desc(plugins.createdAt));
    return NextResponse.json(userPlugins);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { name, domain, description, systemPrompt, citationMode } = body;

    if (!name || typeof name !== "string" || !domain || typeof domain !== "string" || !systemPrompt || typeof systemPrompt !== "string") {
      return NextResponse.json(
        { error: "Missing required fields: name, domain, systemPrompt" },
        { status: 400 },
      );
    }

    // Length limits
    if (name.length > 200) {
      return NextResponse.json({ error: "Name must be under 200 characters" }, { status: 400 });
    }
    if (domain.length > 200) {
      return NextResponse.json({ error: "Domain must be under 200 characters" }, { status: 400 });
    }
    if (systemPrompt.length > 10000) {
      return NextResponse.json({ error: "System prompt must be under 10,000 characters" }, { status: 400 });
    }
    if (description && typeof description === "string" && description.length > 2000) {
      return NextResponse.json({ error: "Description must be under 2,000 characters" }, { status: 400 });
    }

    // Validate citationMode before normalization
    if (citationMode && !ALLOWED_CITATION_MODES.includes(citationMode)) {
      return NextResponse.json(
        { error: `Invalid citationMode. Allowed: ${ALLOWED_CITATION_MODES.join(", ")}` },
        { status: 400 },
      );
    }
    const resolvedCitationMode = citationMode === "off" ? "none" : (citationMode || "mandatory");

    const baseSlug = slugify(name);
    if (!baseSlug) {
      return NextResponse.json(
        { error: "Plugin name must contain at least one alphanumeric character" },
        { status: 400 },
      );
    }

    // Retry loop handles race conditions on slug uniqueness
    let plugin: typeof plugins.$inferSelect | undefined;
    const MAX_SLUG_ATTEMPTS = 10;
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const suffix = attempt === 0 ? "" : attempt <= 5 ? `-${attempt}` : `-${Math.random().toString(36).slice(2, 6)}`;
      const slug = `${baseSlug}${suffix}`;
      const result = await db
        .insert(plugins)
        .values({
          creatorId: user.id,
          name,
          slug,
          domain,
          description: description || null,
          systemPrompt,
          citationMode: resolvedCitationMode,
        })
        .onConflictDoNothing({ target: plugins.slug })
        .returning();

      if (result.length > 0) {
        plugin = result[0];
        break;
      }
    }

    if (!plugin) {
      return NextResponse.json(
        { error: "Could not generate a unique slug. Try a different name." },
        { status: 409 },
      );
    }

    return NextResponse.json(plugin, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
