# Technical Specification: SME-Plug

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | **Next.js 14 (App Router)** | Full-stack in one repo, server actions, API routes, SSR — fast hackathon velocity |
| **Language** | **TypeScript** | Type safety across frontend + backend + SDK |
| **Database** | **Supabase Postgres** | Managed Postgres with pgvector extension — DB + vector search + storage in one |
| **ORM** | **Drizzle ORM** | Type-safe SQL, zero abstraction overhead, schema-as-code, fast migrations via `drizzle-kit` |
| **Vector Store** | **Supabase pgvector** | Embeddings stored alongside relational data — no separate Pinecone/Weaviate needed |
| **File Storage** | **Supabase Storage** | PDF/markdown uploads stored in buckets, referenced by plugin |
| **Auth** | **Clerk** | Drop-in auth UI, Google/GitHub OAuth, JWT sessions, middleware protection — zero custom auth code |
| **AI / LLM** | **OpenAI API (GPT-4o)** | Embedding generation (text-embedding-3-small) + LLM for augmented responses |
| **PDF Parsing** | **pdf-parse** | Extract text from uploaded PDFs for chunking |
| **Embeddings** | **OpenAI text-embedding-3-small** | 1536-dim vectors, cheap, fast, good quality |
| **UI Components** | **shadcn/ui + Tailwind CSS** | Beautiful defaults, copy-paste components, rapid UI building |
| **State Management** | **Zustand** | Lightweight, no boilerplate — for client-side state (decision tree editor, chat) |
| **SDK Distribution** | **npm package (`@sme-plug/sdk`)** | TypeScript SDK that developers install to integrate plugins into their agents |
| **Decision Tree Runtime** | **Custom engine (TypeScript)** | Lightweight JSON-based tree executor — no external dependency |
| **Deployment** | **Vercel** | Zero-config Next.js deployment, edge functions, preview URLs |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SME-PLUG PLATFORM                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Plugin       │  │  Marketplace │  │  Test         │  │
│  │  Builder UI   │  │  / Registry  │  │  Sandbox      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────▼─────────────────▼──────────────────▼───────┐  │
│  │              Next.js API Routes                    │  │
│  │  /api/plugins  /api/query  /api/knowledge-base     │  │
│  └──────┬─────────────────┬──────────────────┬───────┘  │
│         │                 │                  │          │
│  ┌──────▼──┐  ┌──────────▼────────┐  ┌─────▼───────┐  │
│  │ Drizzle  │  │  Citation Engine  │  │  Decision   │  │
│  │ ORM →    │  │  + RAG Pipeline   │  │  Tree       │  │
│  │ Postgres │  │                   │  │  Engine     │  │
│  │ pgvector │  │                   │  │             │  │
│  └─────────┘  └───────────────────┘  └─────────────┘  │
│         ▲                                              │
│  ┌──────┴──┐                                           │
│  │  Clerk  │  (Auth middleware + session management)    │
│  └─────────┘                                           │
└─────────────────────────────────────────────────────────┘
         │
         │  REST API / SDK
         ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL AI AGENTS                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ LangChain│  │ AutoGPT  │  │  Custom   │              │
│  │ Agent    │  │ Agent    │  │  Agent    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema (Drizzle ORM)

All schema is defined in TypeScript using Drizzle. User identity comes from **Clerk** — we store the Clerk `userId` (string) as the foreign key instead of managing our own users table. Auth is enforced at the **middleware/API layer** by Clerk, not via database RLS.

```typescript
// src/lib/db/schema.ts

import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users (synced from Clerk via webhook) ──────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),   // Clerk's user_xxxx ID
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── SME Plugins ────────────────────────────────────────────────────

export const plugins = pgTable("plugins", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  domain: text("domain").notNull(),                // e.g., "structural-engineering"
  systemPrompt: text("system_prompt").notNull(),   // "Think like a Structural Engineer..."
  citationMode: text("citation_mode").default("mandatory").notNull(), // 'mandatory' | 'optional' | 'off'
  version: text("version").default("1.0.0").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  config: jsonb("config").default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("plugins_slug_idx").on(table.slug),
  creatorIdx: index("plugins_creator_idx").on(table.creatorId),
}));

// ─── Knowledge Base Documents (Source of Truth) ─────────────────────

export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  pluginId: uuid("plugin_id").references(() => plugins.id, { onDelete: "cascade" }).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),            // 'pdf' | 'markdown' | 'url' | 'json'
  storagePath: text("storage_path"),                 // Supabase Storage path
  rawText: text("raw_text"),                         // extracted full text
  metadata: jsonb("metadata").default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pluginIdx: index("kd_plugin_idx").on(table.pluginId),
}));

// ─── Knowledge Chunks (for pgvector search) ─────────────────────────

export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").references(() => knowledgeDocuments.id, { onDelete: "cascade" }).notNull(),
  pluginId: uuid("plugin_id").references(() => plugins.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  pageNumber: integer("page_number"),
  sectionTitle: text("section_title"),
  embedding: vector("embedding", { dimensions: 1536 }), // pgvector for text-embedding-3-small
  metadata: jsonb("metadata").default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pluginIdx: index("kc_plugin_idx").on(table.pluginId),
  documentIdx: index("kc_document_idx").on(table.documentId),
  // Note: IVFFlat index on embedding created via custom migration (see below)
}));

// ─── Decision Trees ─────────────────────────────────────────────────

export const decisionTrees = pgTable("decision_trees", {
  id: uuid("id").primaryKey().defaultRandom(),
  pluginId: uuid("plugin_id").references(() => plugins.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  treeData: jsonb("tree_data").notNull().$type<DecisionTreeData>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pluginIdx: index("dt_plugin_idx").on(table.pluginId),
}));

// ─── API Keys (for developers consuming plugins) ───────────────────

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  keyHash: text("key_hash").notNull(),              // hashed API key
  keyPrefix: text("key_prefix").notNull(),          // first 8 chars for display
  name: text("name").notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index("ak_user_idx").on(table.userId),
}));

// ─── Query Audit Log ────────────────────────────────────────────────

export const queryLogs = pgTable("query_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  pluginId: uuid("plugin_id").references(() => plugins.id).notNull(),
  apiKeyId: uuid("api_key_id").references(() => apiKeys.id),
  queryText: text("query_text").notNull(),
  responseText: text("response_text").notNull(),
  citations: jsonb("citations").default([]).$type<CitationEntry[]>(),
  decisionPath: jsonb("decision_path").default([]).$type<DecisionStep[]>(),
  confidence: text("confidence"),                   // 'high' | 'medium' | 'low'
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pluginIdx: index("ql_plugin_idx").on(table.pluginId),
}));

// ─── Relations ──────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  plugins: many(plugins),
  apiKeys: many(apiKeys),
}));

export const pluginsRelations = relations(plugins, ({ one, many }) => ({
  creator: one(users, { fields: [plugins.creatorId], references: [users.id] }),
  documents: many(knowledgeDocuments),
  chunks: many(knowledgeChunks),
  decisionTrees: many(decisionTrees),
  queryLogs: many(queryLogs),
}));

export const knowledgeDocumentsRelations = relations(knowledgeDocuments, ({ one, many }) => ({
  plugin: one(plugins, { fields: [knowledgeDocuments.pluginId], references: [plugins.id] }),
  chunks: many(knowledgeChunks),
}));

export const knowledgeChunksRelations = relations(knowledgeChunks, ({ one }) => ({
  document: one(knowledgeDocuments, { fields: [knowledgeChunks.documentId], references: [knowledgeDocuments.id] }),
  plugin: one(plugins, { fields: [knowledgeChunks.pluginId], references: [plugins.id] }),
}));

export const decisionTreesRelations = relations(decisionTrees, ({ one }) => ({
  plugin: one(plugins, { fields: [decisionTrees.pluginId], references: [plugins.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const queryLogsRelations = relations(queryLogs, ({ one }) => ({
  plugin: one(plugins, { fields: [queryLogs.pluginId], references: [plugins.id] }),
  apiKey: one(apiKeys, { fields: [queryLogs.apiKeyId], references: [apiKeys.id] }),
}));
```

### Drizzle Client Setup

```typescript
// src/lib/db/index.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For queries (connection pooling)
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// Type exports for use across the app
export type Database = typeof db;
```

### Drizzle Config

```typescript
// drizzle.config.ts

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Custom Migration for pgvector Index

Drizzle doesn't natively support IVFFlat indexes. Add a custom SQL migration:

```sql
-- drizzle/migrations/0001_pgvector_index.sql

CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX IF NOT EXISTS kc_embedding_idx
  ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Clerk → Database User Sync (Webhook)

```typescript
// src/app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  const evt = wh.verify(body, {
    "svix-id": svixId!,
    "svix-timestamp": svixTimestamp!,
    "svix-signature": svixSignature!,
  }) as WebhookEvent;

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    const displayName = [first_name, last_name].filter(Boolean).join(" ") || email;

    await db
      .insert(users)
      .values({ clerkId: id, email, displayName, avatarUrl: image_url })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: { email, displayName, avatarUrl: image_url },
      });
  }

  if (evt.type === "user.deleted") {
    await db.delete(users).where(eq(users.clerkId, evt.data.id!));
  }

  return new Response("OK", { status: 200 });
}
```

### Auth Helper (Clerk → DB User)

```typescript
// src/lib/auth.ts

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Get the authenticated user's DB record. Throws if not signed in. */
export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) throw new Error("User not found in database");

  return user;
}
```

---

## 4. Core Engine: Query Pipeline

When an external agent sends a query through a plugin, this is the execution flow:

```
User Query
    │
    ▼
┌───────────────────────┐
│ 1. AUTHENTICATE       │  Validate API key, resolve plugin ID + version
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 2. EMBED QUERY        │  Generate embedding for the user's question
│    (text-embedding-   │  using OpenAI text-embedding-3-small
│     3-small)          │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 3. RETRIEVE SOURCES   │  pgvector similarity search on knowledge_chunks
│    (Top-K = 8)        │  Filter by plugin_id, threshold > 0.75
│                       │  Return: content + document_name + page + section
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 4. DECISION TREE      │  If plugin has active decision trees:
│    EVALUATION         │  - Parse query intent
│                       │  - Walk tree nodes based on extracted parameters
│                       │  - Produce structured reasoning path
│                       │  - Output: reasoning_steps[] + recommended_action
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 5. LLM AUGMENTED      │  Send to GPT-4o with assembled prompt:
│    GENERATION         │  - System prompt (expert persona from plugin)
│                       │  - Retrieved source chunks (with citation IDs)
│                       │  - Decision tree reasoning path
│                       │  - User query
│                       │  - Instruction: "Cite sources inline as [Source N]"
│                       │  - Instruction: "If no source supports a claim,
│                       │    say 'I don't have verified information'"
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 6. CITATION POST-     │  - Parse [Source N] references in response
│    PROCESSING         │  - Map to actual document + page + section
│                       │  - Compute confidence: high (>3 sources),
│                       │    medium (1-2), low (0 but answered anyway)
│                       │  - If confidence = low → replace with refusal
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 7. AUDIT LOG          │  Store: query, response, citations[],
│                       │  decision_path[], confidence, latency
└───────────┬───────────┘
            │
            ▼
  Structured Response → Agent
```

---

## 5. Decision Tree Data Structure

```typescript
// Decision tree stored as JSON in the database
interface DecisionTree {
  id: string;
  name: string;
  description: string;
  rootNodeId: string;
  nodes: Record<string, DecisionNode>;
}

interface DecisionNode {
  id: string;
  type: "condition" | "action" | "question";

  // For 'condition' nodes
  condition?: {
    field: string;          // e.g., "load_type"
    operator: "eq" | "gt" | "lt" | "contains" | "in";
    value: string | number | string[];
  };
  trueChildId?: string;    // next node if condition is true
  falseChildId?: string;   // next node if condition is false

  // For 'question' nodes (ask the user for more info)
  question?: {
    text: string;           // "What type of load is applied?"
    options?: string[];     // ["Dead Load", "Live Load", "Wind Load"]
    extractFrom?: string;   // try to extract from user query first
  };
  childrenByAnswer?: Record<string, string>; // answer → next node ID

  // For 'action' nodes (terminal — produce recommendation)
  action?: {
    recommendation: string; // "Use IS 456 Table 19 for permissible stresses"
    sourceHint: string;     // helps RAG retrieve the right chunk
    severity?: "info" | "warning" | "critical";
  };

  // Metadata
  label: string;            // display label in the editor
}
```

**Runtime Execution:**

```typescript
async function executeDecisionTree(
  tree: DecisionTree,
  query: string,
  extractedParams: Record<string, string>
): Promise<DecisionResult> {
  const path: DecisionStep[] = [];
  let currentNode = tree.nodes[tree.rootNodeId];

  while (currentNode) {
    if (currentNode.type === "condition") {
      const value = extractedParams[currentNode.condition!.field];
      const result = evaluateCondition(currentNode.condition!, value);
      path.push({ nodeId: currentNode.id, label: currentNode.label, result });
      currentNode = tree.nodes[result ? currentNode.trueChildId! : currentNode.falseChildId!];

    } else if (currentNode.type === "question") {
      // Try to extract answer from query context
      const answer = extractedParams[currentNode.question!.extractFrom!]
        || await inferAnswerFromQuery(query, currentNode.question!);
      path.push({ nodeId: currentNode.id, label: currentNode.label, answer });
      currentNode = tree.nodes[currentNode.childrenByAnswer![answer]];

    } else if (currentNode.type === "action") {
      path.push({ nodeId: currentNode.id, label: currentNode.label, action: currentNode.action });
      break; // terminal node
    }
  }

  return { path, recommendation: currentNode?.action };
}
```

---

## 6. API Design

### 6.1 Plugin CRUD (Authenticated — Web App)

```
POST   /api/plugins                    — Create plugin
GET    /api/plugins                    — List my plugins
GET    /api/plugins/:slug              — Get plugin details
PUT    /api/plugins/:id                — Update plugin
DELETE /api/plugins/:id                — Delete plugin
POST   /api/plugins/:id/publish        — Publish plugin
```

### 6.2 Knowledge Base (Authenticated — Web App)

```
POST   /api/plugins/:id/documents      — Upload document (multipart)
GET    /api/plugins/:id/documents      — List documents
DELETE /api/plugins/:id/documents/:docId — Remove document
POST   /api/plugins/:id/documents/:docId/process — Trigger chunk + embed
```

### 6.3 Decision Trees (Authenticated — Web App)

```
POST   /api/plugins/:id/trees          — Create decision tree
GET    /api/plugins/:id/trees          — List trees
PUT    /api/plugins/:id/trees/:treeId  — Update tree
DELETE /api/plugins/:id/trees/:treeId  — Delete tree
```

### 6.4 Query API (API Key Auth — External Agents)

```
POST /api/v1/query
Headers: { "Authorization": "Bearer sme_xxxxx" }
Body: {
  "plugin": "structural-engineering-v1",
  "query": "What is the minimum cover for a beam exposed to weather?",
  "context": [],               // optional prior conversation
  "options": {
    "citationMode": "inline",  // 'inline' | 'footnote' | 'off'
    "maxSources": 5,
    "includeDecisionPath": true
  }
}

Response: {
  "answer": "According to IS 456:2000, the minimum nominal cover for a beam exposed to weather is 45mm [Source 1].",
  "citations": [
    {
      "id": "src_1",
      "document": "IS 456:2000",
      "page": 47,
      "section": "Table 16, Clause 26.4.2",
      "excerpt": "For severe exposure conditions, nominal cover shall not be less than 45mm..."
    }
  ],
  "decisionPath": [
    { "step": 1, "node": "exposure_check", "label": "Exposure condition?", "value": "severe" },
    { "step": 2, "node": "member_type", "label": "Member type?", "value": "beam" },
    { "step": 3, "node": "cover_lookup", "label": "Look up cover", "result": "45mm" }
  ],
  "confidence": "high",
  "pluginVersion": "1.0.0"
}
```

### 6.5 Marketplace (Public)

```
GET /api/marketplace                    — Browse published plugins
GET /api/marketplace/:slug              — Plugin detail page
GET /api/marketplace/:slug/stats        — Usage statistics
```

---

## 7. SDK Design (`@sme-plug/sdk`)

```typescript
import { SMEPlug } from "@sme-plug/sdk";

// Initialize
const sme = new SMEPlug({
  apiKey: "sme_xxxxx",
});

// Query a plugin
const result = await sme.query({
  plugin: "structural-engineering-v1",
  query: "What is the minimum cover for an RCC column?",
});

console.log(result.answer);       // cited answer
console.log(result.citations);    // source references
console.log(result.decisionPath); // reasoning trace

// Hot-swap plugin at runtime
sme.setActivePlugin("hvac-design-v1");

// LangChain integration
import { SMEPlugTool } from "@sme-plug/sdk/langchain";

const tool = new SMEPlugTool({
  apiKey: "sme_xxxxx",
  plugin: "structural-engineering-v1",
  name: "structural_expert",
  description: "Consult a structural engineering expert with cited sources",
});

// Use in a LangChain agent
const agent = createOpenAIToolsAgent({
  llm,
  tools: [tool, ...otherTools],
  prompt,
});
```

---

## 8. Project Structure

```
hackx/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Clerk auth pages
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx  # Clerk <SignIn />
│   │   │   └── sign-up/[[...sign-up]]/page.tsx  # Clerk <SignUp />
│   │   ├── (dashboard)/              # Authenticated pages (behind Clerk middleware)
│   │   │   ├── plugins/
│   │   │   │   ├── page.tsx          # List my plugins
│   │   │   │   ├── new/page.tsx      # Create plugin
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Plugin detail/edit
│   │   │   │       ├── knowledge/page.tsx  # Manage knowledge base
│   │   │   │       ├── trees/page.tsx      # Decision tree editor
│   │   │   │       └── sandbox/page.tsx    # Test sandbox
│   │   │   ├── marketplace/
│   │   │   │   ├── page.tsx          # Browse plugins
│   │   │   │   └── [slug]/page.tsx   # Plugin detail
│   │   │   ├── api-keys/page.tsx     # Manage API keys
│   │   │   └── analytics/page.tsx    # Usage dashboard
│   │   ├── api/
│   │   │   ├── plugins/              # Plugin CRUD routes
│   │   │   ├── knowledge/            # Document upload + processing
│   │   │   ├── trees/                # Decision tree CRUD
│   │   │   ├── v1/
│   │   │   │   └── query/route.ts    # Main query endpoint (API key auth)
│   │   │   ├── marketplace/          # Public marketplace
│   │   │   ├── api-keys/             # API key management
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts    # Clerk user sync webhook
│   │   ├── layout.tsx                # Wraps with <ClerkProvider>
│   │   └── page.tsx                  # Landing page
│   ├── middleware.ts                  # Clerk authMiddleware — protects (dashboard) routes
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle client (postgres-js driver)
│   │   │   └── schema.ts             # All Drizzle table + relation definitions
│   │   ├── auth.ts                   # requireUser() helper (Clerk → DB lookup)
│   │   ├── supabase/
│   │   │   └── storage.ts            # Supabase Storage client (file uploads only)
│   │   ├── engine/
│   │   │   ├── query-pipeline.ts     # Main query orchestrator
│   │   │   ├── embedding.ts          # OpenAI embedding generation
│   │   │   ├── retrieval.ts          # pgvector similarity search (via Drizzle sql``)
│   │   │   ├── decision-tree.ts      # Tree execution engine
│   │   │   ├── citation.ts           # Citation post-processor
│   │   │   ├── hallucination-guard.ts # Confidence check + refusal
│   │   │   └── chunker.ts            # Document text chunking
│   │   ├── types/
│   │   │   ├── plugin.ts
│   │   │   ├── decision-tree.ts
│   │   │   ├── query.ts
│   │   │   └── citation.ts
│   │   └── utils/
│   │       ├── pdf-parser.ts         # PDF text extraction
│   │       └── api-key.ts            # Key generation + hashing
│   ├── components/
│   │   ├── ui/                       # shadcn components
│   │   ├── plugin-builder/
│   │   │   ├── knowledge-uploader.tsx
│   │   │   ├── tree-editor.tsx
│   │   │   └── prompt-composer.tsx
│   │   ├── sandbox/
│   │   │   └── chat-interface.tsx
│   │   ├── marketplace/
│   │   │   ├── plugin-card.tsx
│   │   │   └── plugin-grid.tsx
│   │   └── shared/
│   │       ├── citation-badge.tsx
│   │       └── confidence-indicator.tsx
│   └── store/
│       └── tree-editor-store.ts      # Zustand store for decision tree editor
├── packages/
│   └── sdk/                          # @sme-plug/sdk (npm package)
│       ├── src/
│       │   ├── index.ts              # Core SDK
│       │   ├── langchain.ts          # LangChain adapter
│       │   ├── autogpt.ts            # AutoGPT adapter
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
├── drizzle/
│   └── migrations/                   # Generated by drizzle-kit + custom SQL
│       ├── 0000_initial_schema.sql   # Auto-generated from schema.ts
│       └── 0001_pgvector_index.sql   # Custom: CREATE EXTENSION vector + IVFFlat index
├── drizzle.config.ts                 # Drizzle Kit configuration
├── .env.local                        # All secrets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 9. Key Implementation Details

### 9.1 Document Chunking Strategy

```typescript
// lib/engine/chunker.ts
function chunkDocument(text: string, options: ChunkOptions): Chunk[] {
  // Strategy: sliding window with overlap
  const CHUNK_SIZE = 512;      // tokens
  const OVERLAP = 64;          // token overlap between chunks

  // 1. Split by natural boundaries first (headings, paragraphs)
  // 2. If a section > CHUNK_SIZE, apply sliding window
  // 3. Preserve metadata: page number, section title, chunk index
  // 4. Each chunk gets: { content, pageNumber, sectionTitle, chunkIndex }
}
```

### 9.2 Hallucination Guard Prompt

```typescript
const HALLUCINATION_GUARD = `
CRITICAL RULES:
1. ONLY use information from the provided source documents.
2. For EVERY factual claim, include an inline citation: [Source N].
3. If the source documents do NOT contain information to answer the question,
   respond EXACTLY: "I don't have verified information on this topic in my
   knowledge base. Please consult a qualified professional."
4. NEVER fabricate citations or reference documents not provided.
5. If partially answerable, answer what you can with citations and clearly
   state what you cannot verify.
`;
```

### 9.3 Hot-Swap Implementation

```typescript
// In the SDK — plugins are stateless per-request, so hot-swap is trivial
class SMEPlug {
  private activePlugin: string;

  setActivePlugin(pluginSlug: string) {
    this.activePlugin = pluginSlug; // next query uses this plugin
  }

  async query(opts: QueryOptions) {
    const plugin = opts.plugin || this.activePlugin;
    // Each request is independent — no state to tear down
    return fetch(`${this.baseUrl}/api/v1/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ plugin, query: opts.query }),
    }).then(r => r.json());
  }
}
```

---

## 10. Hackathon Execution Plan

### Phase 1: Foundation (Hours 0-3)
- [x] Initialize Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Set up Clerk project (Google OAuth, configure sign-in/sign-up URLs)
- [ ] Add Clerk middleware to protect `/dashboard/*` routes
- [ ] Set up Supabase Postgres + Storage (DB + file uploads only, not auth)
- [ ] Define Drizzle schema, run `drizzle-kit push` to create tables
- [ ] Run custom migration for pgvector extension + IVFFlat index
- [ ] Set up Clerk webhook → user sync to DB
- [ ] Implement `requireUser()` auth helper

### Phase 2: Core Engine (Hours 3-8)
- [ ] PDF upload → text extraction → chunking → embedding pipeline
- [ ] pgvector similarity search function
- [ ] Decision tree JSON parser + runtime executor
- [ ] Query pipeline orchestrator (embed → retrieve → tree → LLM → cite)
- [ ] Hallucination guard + citation post-processor
- [ ] `/api/v1/query` endpoint

### Phase 3: Web App (Hours 8-14)
- [ ] Plugin creation form (name, domain, system prompt)
- [ ] Knowledge base upload UI (drag-and-drop PDFs)
- [ ] Decision tree editor (JSON editor + preview)
- [ ] Test sandbox (chat interface that hits the query API)
- [ ] Plugin publish flow

### Phase 4: Integration & Demo (Hours 14-18)
- [ ] Build `@sme-plug/sdk` with LangChain adapter
- [ ] Create demo plugin: "Structural Engineering - IS 456"
- [ ] Upload IS 456 relevant sections as knowledge base
- [ ] Build decision tree for beam/column design checks
- [ ] End-to-end demo: LangChain agent using the plugin
- [ ] Marketplace browse page

### Phase 5: Polish & Present (Hours 18-20)
- [ ] Landing page with clear value prop
- [ ] Demo video / live walkthrough script
- [ ] Error handling and loading states
- [ ] Deploy to Vercel

---

## 11. Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (Supabase Postgres connection string — used by Drizzle)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Supabase (Storage only — file uploads)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. Third-Party Dependencies

```json
{
  "dependencies": {
    "next": "^14.2",
    "@clerk/nextjs": "^5",
    "svix": "^1.30",
    "drizzle-orm": "^0.33",
    "postgres": "^3.4",
    "@supabase/supabase-js": "^2.45",
    "openai": "^4.55",
    "pdf-parse": "^1.1",
    "zustand": "^4.5",
    "zod": "^3.23",
    "tailwindcss": "^3.4",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "drizzle-kit": "^0.24"
  }
}
```