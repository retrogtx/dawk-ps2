# Technical Specification: Lexic

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
| **AI / LLM** | **Vercel AI SDK (`ai`) + OpenAI provider (`@ai-sdk/openai`)** | Unified streaming/generation API, provider-swappable; uses GPT-4o for generation + text-embedding-3-small for embeddings |
| **PDF Parsing** | **pdf-parse** | Extract text from uploaded PDFs for chunking |
| **Embeddings** | **OpenAI text-embedding-3-small (via `@ai-sdk/openai`)** | 1536-dim vectors, cheap, fast, good quality — called through Vercel AI SDK's `embed()` |
| **UI Components** | **shadcn/ui + Tailwind CSS** | Beautiful defaults, copy-paste components, rapid UI building |
| **State Management** | **Zustand** | Lightweight, no boilerplate — for client-side state (decision tree editor, chat) |
| **SDK Distribution** | **npm package (`lexic-sdk`)** | TypeScript SDK that developers install to integrate plugins into their agents |
| **Decision Tree Runtime** | **Custom engine (TypeScript)** | Lightweight JSON-based tree executor — no external dependency |
| **Deployment** | **Vercel** | Zero-config Next.js deployment, edge functions, preview URLs |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    LEXIC PLATFORM                     │
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

// ─── Plugins ────────────────────────────────────────────────────────

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

### Auth Helper (Clerk → DB User, Auto-Create)

No webhook is needed. User records are created on-demand when `requireUser()` is called — if the Clerk user exists but has no DB row, one is auto-created via upsert:

```typescript
// lib/auth.ts

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (existing) return existing;

  // Auto-create from Clerk profile
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const [user] = await db
    .insert(users)
    .values({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      displayName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || email,
      avatarUrl: clerkUser.imageUrl,
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { email, displayName, avatarUrl: clerkUser.imageUrl },
    })
    .returning();

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
│    (text-embedding-   │  using Vercel AI SDK embed() with OpenAI
│     3-small)          │  text-embedding-3-small provider
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
│ 5. LLM AUGMENTED      │  Send to GPT-4o via Vercel AI SDK generateText():
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
Headers: { "Authorization": "Bearer lx_xxxxx" }
Body: {
  "plugin": "structural-engineering-v1",
  "query": "What is the minimum cover for a beam exposed to weather?",
  "context": [                  // optional prior conversation
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
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

// Streaming: set "stream": true in body or Accept: text/event-stream header.
// Server sends SSE events:
//   data: { "type": "status", "status": "searching_kb", "message": "..." }
//   data: { "type": "delta", "text": "token..." }
//   data: { "type": "done", "answer": "...", "citations": [...], "decisionPath": [...], "confidence": "high", "pluginVersion": "1.0.0" }
//   data: { "type": "error", "error": "..." }
```

### 6.5 Marketplace (Public)

```
GET /api/marketplace                    — Browse published plugins
GET /api/marketplace/:slug              — Plugin detail page
GET /api/marketplace/:slug/stats        — Usage statistics
```

---

## 7. SDK Design (`lexic-sdk`)

### 7.1 Core Client

```typescript
import { Lexic } from "lexic-sdk";

// Initialize
const lexic = new Lexic({
  apiKey: "lx_xxxxx",
  baseUrl: "https://...",          // optional — custom API endpoint
  defaultPlugin: "my-plugin-v1",   // optional — default plugin for queries
  timeout: 30000,                  // optional — request timeout in ms (default: 120s)
});

// Query a plugin
const result = await lexic.query({
  plugin: "structural-engineering-v1",
  query: "What is the minimum cover for an RCC column?",
  context: [                        // optional — conversation history
    { role: "user", content: "prior question" },
    { role: "assistant", content: "prior answer" },
  ],
  options: {                        // optional — per-request settings
    citationMode: "inline",         // 'inline' | 'footnote' | 'off'
    maxSources: 5,
    includeDecisionPath: true,
  },
});

console.log(result.answer);       // cited answer (normalized, cleaned of phantom refs)
console.log(result.citations);    // source references with full metadata
console.log(result.decisionPath); // reasoning trace
console.log(result.confidence);   // "high" | "medium" | "low"
console.log(result.pluginVersion);

// Hot-swap plugin at runtime
lexic.setActivePlugin("hvac-design-v1");
```

### 7.2 Streaming

```typescript
// Token-by-token streaming with pipeline status events
for await (const event of lexic.queryStream({ plugin: "my-plugin", query: "..." })) {
  if (event.type === "status") console.log(`[${event.status}] ${event.message}`);
  if (event.type === "delta") process.stdout.write(event.text);
  if (event.type === "done") console.log(event.answer, event.citations);
  if (event.type === "error") console.error(event.error);
}

// Or: stream with progress callbacks, resolve to a single QueryResult
const result = await lexic.queryStreamToResult(
  { plugin: "my-plugin", query: "..." },
  (event) => { if (event.type === "delta") process.stdout.write(event.text); },
);
```

### 7.3 LangChain Integration

```typescript
import { LexicTool } from "lexic-sdk/langchain";

const tool = new LexicTool({
  apiKey: "lx_xxxxx",
  plugin: "structural-engineering-v1",
  name: "structural_expert",
  description: "Consult a structural engineering expert with cited sources",
  queryOptions: { citationMode: "inline", maxSources: 5 },  // optional defaults
});

// Use in a LangChain agent — returns JSON with answer, citations, confidence, decisionPath
const agent = createOpenAIToolsAgent({
  llm,
  tools: [tool, ...otherTools],
  prompt,
});

// Hot-swap mid-conversation
tool.setPlugin("hvac-design-v1");
```

### 7.4 AutoGPT Integration

```typescript
import { LexicAutoGPT } from "lexic-sdk/autogpt";

const adapter = new LexicAutoGPT({
  apiKey: "lx_xxxxx",
  plugin: "structural-engineering-v1",
  queryOptions: { citationMode: "inline" },  // optional defaults
});

// Register as an AutoGPT command — returns human-readable text with citations
const command = adapter.asCommand();
```

### 7.5 Response Normalization

The SDK normalizes all API responses before returning them. Missing fields, wrong types, and unexpected shapes are handled gracefully:

- `answer` defaults to `""` if missing or non-string
- `citations` and `decisionPath` default to `[]` if missing or non-array
- `confidence` defaults to `"low"` if missing or invalid
- `pluginVersion` defaults to `"unknown"` if missing
- Each citation and decision step is individually validated

This ensures callers always receive a predictable `QueryResult` regardless of API version.

---

## 8. Project Structure

```
hackx/
├── app/                               # Next.js App Router (no src/ prefix)
│   ├── layout.tsx                     # Root layout (<ClerkProvider>, fonts, Toaster)
│   ├── page.tsx                       # Landing page
│   ├── globals.css                    # Global styles
│   ├── docs/page.tsx                  # Documentation page
│   ├── (auth)/                        # Clerk auth pages
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/                   # Dashboard layout (sidebar nav, protected by Clerk)
│   │   ├── layout.tsx                 # Sidebar with nav: Plugins, Marketplace, API Keys
│   │   ├── plugins/
│   │   │   ├── page.tsx               # Plugin list with search
│   │   │   ├── plugins-grid.tsx       # Grid component (export JSON, etc.)
│   │   │   ├── new/page.tsx           # Create plugin
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Plugin detail page
│   │   │       ├── plugin-settings.tsx # Settings form
│   │   │       ├── publish-button.tsx  # Publish/unpublish toggle
│   │   │       ├── share-qr-button.tsx # QR code share button
│   │   │       ├── knowledge/page.tsx  # Knowledge base management
│   │   │       ├── trees/page.tsx      # Decision tree editor
│   │   │       └── sandbox/page.tsx    # Streaming test sandbox
│   │   ├── marketplace/
│   │   │   ├── page.tsx               # Browse shared plugins
│   │   │   └── [slug]/
│   │   │       ├── page.tsx           # Plugin detail
│   │   │       └── marketplace-actions.tsx  # Download/action buttons
│   │   └── api-keys/page.tsx          # API key CRUD (create, reveal, revoke)
│   └── api/
│       ├── v1/query/route.ts          # Main query endpoint (API key auth, JSON + SSE streaming)
│       ├── sandbox/[pluginId]/route.ts # Sandbox streaming endpoint (Clerk auth)
│       ├── plugins/
│       │   ├── route.ts               # GET (list), POST (create)
│       │   └── [id]/
│       │       ├── route.ts           # GET, PATCH, DELETE
│       │       ├── export/route.ts    # Export plugin as JSON
│       │       ├── documents/route.ts # Knowledge document CRUD + chunking
│       │       └── trees/route.ts     # Decision tree CRUD
│       ├── api-keys/route.ts          # GET, POST, PATCH (reveal), DELETE
│       └── marketplace/[slug]/download/route.ts  # Download shared plugin
├── middleware.ts                       # Clerk clerkMiddleware — protects /plugins, /api-keys, /api/plugins, /api/sandbox
├── lib/
│   ├── db/
│   │   ├── index.ts                   # Drizzle client (postgres-js driver)
│   │   └── schema.ts                  # Tables, types, relations (users, plugins, knowledge_documents, knowledge_chunks, decision_trees, api_keys, query_logs)
│   ├── auth.ts                        # requireUser() — Clerk → DB user lookup with auto-create
│   ├── utils.ts                       # cn() — clsx + tailwind-merge
│   ├── utils/
│   │   └── api-key.ts                 # generateApiKey(), hashApiKey(), encryptApiKey(), decryptApiKey()
│   └── engine/
│       ├── query-pipeline.ts          # runQueryPipeline() + streamQueryPipeline()
│       ├── embedding.ts               # embedText() + embedTexts() via Vercel AI SDK
│       ├── retrieval.ts               # pgvector cosine similarity (top-K=8, threshold=0.3)
│       ├── chunker.ts                 # chunkText() — 1500-char chunks, 200-char overlap
│       ├── decision-tree.ts           # executeDecisionTree() — JSON tree walker
│       ├── citation.ts                # processCitations() — parse [Source N], map to docs, confidence
│       └── hallucination-guard.ts     # applyHallucinationGuard() — refusal on low confidence
├── components/
│   ├── ui/                            # shadcn/ui components (button, input, textarea, label, dialog, dropdown-menu, select, tabs, badge, sonner, silk)
│   └── silk-background.tsx            # Animated silk background
├── packages/
│   └── sdk/                           # lexic-sdk (npm package)
│       ├── src/
│       │   ├── index.ts               # Core: Lexic class, query(), queryStream(), queryStreamToResult()
│       │   ├── types.ts               # Shared types
│       │   ├── langchain.ts           # LexicTool adapter
│       │   ├── autogpt.ts             # LexicAutoGPT adapter
│       │   └── __tests__/sdk.test.ts  # 69 unit tests
│       ├── package.json
│       └── tsconfig.json
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 9. Key Implementation Details

### 9.1 Document Chunking Strategy

```typescript
// lib/engine/chunker.ts
const CHUNK_SIZE = 1500;  // characters (not tokens)
const OVERLAP = 200;      // character overlap between chunks

function chunkText(text: string, opts?: { fileName?: string; fileType?: string }): Chunk[] {
  // 1. Split by double-newline (paragraph boundaries)
  // 2. Accumulate into buffer until CHUNK_SIZE exceeded
  // 3. On overflow: emit chunk, carry OVERLAP chars into next buffer
  // 4. Extract section title from markdown headers or short first lines
  // 5. Each chunk gets: { content, chunkIndex, sectionTitle?, metadata }
}
```

### 9.2 Hallucination Guard

The guard is a post-processing step (not a prompt), implemented in `lib/engine/hallucination-guard.ts`. It checks the citation engine's output and refuses if:

1. **Zero real citations** — AI cited nothing from the knowledge base
2. **Self-refusal detected** — short answer (<300 chars) containing phrases like "I don't have verified information" (long answers with standard disclaimers are NOT flagged)
3. **Phantom majority** — more phantom [Source N] refs (pointing to nonexistent sources) than real refs

The LLM prompt uses a "source priority" approach rather than strict refusal — it prioritizes knowledge base sources but may supplement with its own knowledge or web search when sources are insufficient. The guard catches cases where the AI fabricated citations or had no relevant sources.

### 9.3 Hot-Swap Implementation

Plugins are stateless per-request, so hot-swapping is trivial — just change the slug:

```typescript
// In the SDK — each request is independent, no state to tear down
class Lexic {
  private activePlugin: string | null;

  setActivePlugin(pluginSlug: string) {
    this.activePlugin = pluginSlug;
  }

  async query(opts: QueryOptions) {
    const plugin = opts.plugin || this.activePlugin;
    const body: Record<string, unknown> = { plugin, query: opts.query };
    if (opts.context?.length) body.context = opts.context;
    if (opts.options) body.options = opts.options;

    const res = await fetch(`${this.baseUrl}/api/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    // Response is normalized — missing fields get safe defaults
    return normalizeQueryResult(await res.json());
  }
}
```

The LangChain and AutoGPT adapters also support hot-swap via `setPlugin()`:

```typescript
tool.setPlugin("hvac-design-v1");   // LexicTool (LangChain)
adapter.setPlugin("hvac-design-v1"); // LexicAutoGPT
```

---

## 10. Implementation Progress

See `PRD.md` section 5 for the detailed, up-to-date task checklist. The SPEC does not duplicate it.

---

## 11. Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (Supabase Postgres connection string — used by Drizzle)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Supabase (used for Postgres connection; Storage integration removed)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (read automatically by @ai-sdk/openai provider)
OPENAI_API_KEY=sk-...

# API key encryption (used by lib/utils/api-key.ts for AES-256-GCM)
ENCRYPTION_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```