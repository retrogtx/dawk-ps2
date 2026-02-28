import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { plugins, knowledgeDocuments, knowledgeChunks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { chunkText } from "@/lib/engine/chunker";
import { embedTexts } from "@/lib/engine/embedding";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_SIZE = 10 * 1024 * 1024; // 10MB for pasted text
const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
];
const ALLOWED_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".pdf"];

type User = Awaited<ReturnType<typeof requireUser>>;

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

    // Exclude rawText from listing to avoid returning 10MB+ per document
    const docs = await db
      .select({
        id: knowledgeDocuments.id,
        pluginId: knowledgeDocuments.pluginId,
        fileName: knowledgeDocuments.fileName,
        fileType: knowledgeDocuments.fileType,
        storagePath: knowledgeDocuments.storagePath,
        createdAt: knowledgeDocuments.createdAt,
      })
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.pluginId, id));

    return NextResponse.json(docs);
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

    // Verify ownership
    const plugin = await db.query.plugins.findFirst({
      where: and(eq(plugins.id, id), eq(plugins.creatorId, user.id)),
    });
    if (!plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    // Sanitize fileName: strip dangerous chars, limit length
    const rawFileName = String(formData.get("fileName") || file?.name || "untitled");
    const fileName = rawFileName.slice(0, 255).replace(/[<>"/\\]/g, "");
    const fileType = String(formData.get("fileType") || "markdown").slice(0, 50);

    let rawText = text || "";

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 },
        );
      }

      // Validate by MIME type and file extension — reject if either is present and invalid
      const ext = file.name ? `.${file.name.split(".").pop()?.toLowerCase()}` : "";
      const mimeValid = file.type !== "" ? ALLOWED_MIME_TYPES.includes(file.type) : true;
      const extValid = ext !== "" && ext !== "." ? ALLOWED_EXTENSIONS.includes(ext) : false;
      if (!mimeValid || !extValid) {
        return NextResponse.json(
          { error: `Unsupported file. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}` },
          { status: 400 },
        );
      }

      rawText = await file.text();
    }

    // Limit pasted text size
    if (rawText.length > MAX_TEXT_SIZE) {
      return NextResponse.json(
        { error: `Content too large. Maximum size is ${MAX_TEXT_SIZE / 1024 / 1024}MB` },
        { status: 400 },
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 },
      );
    }

    // 1. Create document record
    const [doc] = await db
      .insert(knowledgeDocuments)
      .values({
        pluginId: id,
        fileName,
        fileType,
        rawText,
      })
      .returning();

    // 2. Chunk the text
    const chunks = chunkText(rawText, { fileName, fileType });

    // 3. Embed all chunks (skip if no chunks to avoid empty API call)
    const chunkTexts = chunks.map((c) => c.content);
    const embeddings = chunks.length > 0 ? await embedTexts(chunkTexts) : [];

    // 4. Insert chunks with embeddings
    if (chunks.length > 0) {
      await db.insert(knowledgeChunks).values(
        chunks.map((chunk, i) => ({
          documentId: doc.id,
          pluginId: id,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber ?? null,
          sectionTitle: chunk.sectionTitle ?? null,
          embedding: embeddings[i],
          metadata: chunk.metadata,
        })),
      );
    }

    return NextResponse.json({
      id: doc.id,
      pluginId: doc.pluginId,
      fileName: doc.fileName,
      fileType: doc.fileType,
      chunksCreated: chunks.length,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");

    if (!docId) {
      return NextResponse.json({ error: "Missing docId" }, { status: 400 });
    }

    const plugin = await db.query.plugins.findFirst({
      where: and(eq(plugins.id, id), eq(plugins.creatorId, user.id)),
    });
    if (!plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }

    await db
      .delete(knowledgeDocuments)
      .where(
        and(
          eq(knowledgeDocuments.id, docId),
          eq(knowledgeDocuments.pluginId, id),
        ),
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
