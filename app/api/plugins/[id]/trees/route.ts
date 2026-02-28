import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { plugins, decisionTrees } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

type User = Awaited<ReturnType<typeof requireUser>>;

const MAX_NODES = 500;

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
    });
    if (!plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }

    const trees = await db
      .select()
      .from(decisionTrees)
      .where(eq(decisionTrees.pluginId, id));

    return NextResponse.json(trees);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const plugin = await db.query.plugins.findFirst({
      where: and(eq(plugins.id, id), eq(plugins.creatorId, user.id)),
    });
    if (!plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { name, description, treeData } = body;

    if (!name || typeof name !== "string" || name.length > 200) {
      return NextResponse.json(
        { error: "name must be a string under 200 characters" },
        { status: 400 },
      );
    }

    if (!treeData) {
      return NextResponse.json(
        { error: "Missing required field: treeData" },
        { status: 400 },
      );
    }

    // Validate treeData structure
    if (
      typeof treeData !== "object" ||
      typeof treeData.rootNodeId !== "string" ||
      typeof treeData.nodes !== "object" ||
      treeData.nodes === null
    ) {
      return NextResponse.json(
        { error: "Invalid treeData: must have rootNodeId (string) and nodes (object)" },
        { status: 400 },
      );
    }

    // Guard against prototype pollution — use hasOwnProperty
    if (!Object.prototype.hasOwnProperty.call(treeData.nodes, treeData.rootNodeId)) {
      return NextResponse.json(
        { error: "Root node not found in nodes" },
        { status: 400 },
      );
    }

    // Limit node count
    const nodeEntries = Object.entries(treeData.nodes);
    if (nodeEntries.length > MAX_NODES) {
      return NextResponse.json(
        { error: `Tree cannot exceed ${MAX_NODES} nodes` },
        { status: 400 },
      );
    }

    // Validate each node
    for (const [nodeId, node] of nodeEntries) {
      const n = node as Record<string, unknown>;
      if (
        !n ||
        typeof n !== "object" ||
        typeof n.id !== "string" ||
        typeof n.type !== "string" ||
        typeof n.label !== "string"
      ) {
        return NextResponse.json(
          { error: `Invalid node "${nodeId}": must have string id, type, and label` },
          { status: 400 },
        );
      }
      if (n.id !== nodeId) {
        return NextResponse.json(
          { error: `Invalid node "${nodeId}": id field must match the node key` },
          { status: 400 },
        );
      }
      if (!["condition", "action", "question"].includes(n.type)) {
        return NextResponse.json(
          { error: `Invalid node "${nodeId}": type must be "condition", "action", or "question"` },
          { status: 400 },
        );
      }
      // Condition nodes must have condition.field and condition.operator
      if (n.type === "condition") {
        const cond = n.condition as Record<string, unknown> | undefined;
        if (!cond || typeof cond.field !== "string" || typeof cond.operator !== "string") {
          return NextResponse.json(
            { error: `Condition node "${nodeId}": must have condition.field and condition.operator` },
            { status: 400 },
          );
        }
      }
    }

    const [tree] = await db
      .insert(decisionTrees)
      .values({
        pluginId: id,
        name,
        description: typeof description === "string" ? description.slice(0, 1000) : null,
        treeData,
      })
      .returning();

    return NextResponse.json(tree, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
