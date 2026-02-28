"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FlaskConical,
  ArrowRight,
  Copy,
  Check,
  Key,
  Plug,
  FileText,
  GitBranch,
  Zap,
  Terminal,
  BookOpen,
  Code2,
  Search,
  ExternalLink,
  Users,
  MessageSquare,
  Download,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute right-3 top-3 rounded-md border border-[#333] bg-[#1a1a1a] p-1.5 text-[#666] transition-colors hover:border-[#444] hover:text-[#999]"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-[#262626] bg-[#0d0d0d]">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-4 py-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-[#444]">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="text-[#b0b0b0]">{code}</code>
      </pre>
    </div>
  );
}

function ParamRow({
  name,
  type,
  required,
  description,
}: {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}) {
  return (
    <tr className="border-b border-[#1a1a1a] last:border-0">
      <td className="px-4 py-3 align-top">
        <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">{name}</code>
      </td>
      <td className="px-4 py-3 align-top">
        <span className="text-[13px] text-[#888]">{type}</span>
      </td>
      <td className="px-4 py-3 align-top">
        {required ? (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Required</span>
        ) : (
          <span className="text-[11px] uppercase tracking-wider text-[#555]">Optional</span>
        )}
      </td>
      <td className="px-4 py-3 align-top text-[13px] text-[#999]">{description}</td>
    </tr>
  );
}

function StatusBadge({ code, color }: { code: number; color: string }) {
  const colorMap: Record<string, string> = {
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
    yellow: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${colorMap[color]}`}>
      {code}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    POST: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    PUT: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    PATCH: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    DELETE: "border-red-500/30 bg-red-500/10 text-red-400",
  };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${colors[method]}`}>
      {method}
    </span>
  );
}

const sections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "authentication", label: "Authentication", icon: Key },
  { id: "query", label: "Query Endpoint", icon: Zap },
  { id: "collaborate", label: "Collaborate Endpoint", icon: Users },
  { id: "plugins", label: "Plugins", icon: Plug },
  { id: "documents", label: "Knowledge Docs", icon: FileText },
  { id: "trees", label: "Decision Trees", icon: GitBranch },
  { id: "collab-rooms", label: "Collaboration Rooms", icon: MessageSquare },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "sandbox", label: "Sandbox", icon: Terminal },
  { id: "export", label: "Plugin Export", icon: Download },
  { id: "marketplace", label: "Marketplace", icon: Store },
  { id: "sdk", label: "SDK Reference", icon: Code2 },
  { id: "sdk-collab", label: "SDK Collaboration", icon: Users },
  { id: "langchain", label: "LangChain", icon: ExternalLink },
  { id: "autogpt", label: "AutoGPT", icon: ExternalLink },
  { id: "types", label: "TypeScript Types", icon: Code2 },
  { id: "errors", label: "Errors", icon: Search },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-white">
            <FlaskConical className="h-5 w-5" />
            Lexic
          </Link>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-[#262626] bg-[#111] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#666]">
              Documentation
            </span>
            <Button size="sm" className="bg-white text-black hover:bg-[#ccc] font-semibold" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-[#262626] p-4 lg:block">
          <nav className="space-y-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                  activeSection === s.id
                    ? "bg-[#1a1a1a] text-white font-medium"
                    : "text-[#777] hover:bg-[#111] hover:text-[#bbb]"
                }`}
              >
                <s.icon className="h-3.5 w-3.5 shrink-0" />
                {s.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">Install SDK</p>
            <div className="mt-2 rounded bg-[#0a0a0a] px-3 py-2">
              <code className="text-[12px] text-emerald-400">npm i lexic-sdk</code>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-6 py-10 lg:px-12">
          <div className="mx-auto max-w-3xl">

            {/* ── Overview ── */}
            <section id="overview" className="scroll-mt-20">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Lexic HDK</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white">API Reference</h1>
              <p className="mt-4 text-[15px] leading-relaxed text-[#999]">
                The Lexic API enables you to integrate subject matter expert plugins into any AI agent.
                Every response is backed by source citations, decision-tree reasoning, and a hallucination guard.
                Multi-expert collaboration lets you pit domain experts against each other for adversarial reasoning.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[#262626] bg-[#111] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">Base URL</p>
                  <code className="mt-1.5 block text-[14px] text-white">https://dawk-ps2.vercel.app</code>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">SDK Package</p>
                  <code className="mt-1.5 block text-[14px] text-white">lexic-sdk</code>
                </div>
              </div>

              <div className="mt-6 rounded-md border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-[13px] leading-relaxed text-amber-300/90">
                  <strong className="text-amber-300">Two auth modes:</strong> Dashboard routes use Clerk JWT sessions.
                  The <code className="rounded bg-amber-500/10 px-1 text-[12px]">/api/v1/query</code> and <code className="rounded bg-amber-500/10 px-1 text-[12px]">/api/v1/collaborate</code> endpoints use Bearer token API key auth for external agent integrations.
                </p>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Authentication ── */}
            <section id="authentication" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Authentication</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                The external API endpoints (<code className="text-[#bbb]">/api/v1/query</code> and <code className="text-[#bbb]">/api/v1/collaborate</code>) authenticate via API key sent as a Bearer token.
                Generate keys from the <Link href="/api-keys" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">API Keys</Link> page in the dashboard.
              </p>

              <CodeBlock
                language="http"
                code={`Authorization: Bearer lx_a1b2c3d4e5f6...`}
              />

              <p className="mt-4 text-[13px] text-[#777]">
                All other <code className="text-[#bbb]">/api/*</code> endpoints (plugins, documents, trees, collaboration rooms, api-keys) require a Clerk session cookie — they are for the web dashboard, not for external agent calls.
              </p>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Query Endpoint ── */}
            <section id="query" className="scroll-mt-20">
              <div className="flex items-center gap-3">
                <MethodBadge method="POST" />
                <h2 className="text-2xl font-bold text-white">/api/v1/query</h2>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                The core endpoint. Send a question and a plugin slug, and get back a cited, decision-tree-backed expert answer.
                Supports both JSON and SSE streaming responses, conversation context for multi-turn dialogues, and per-request query options.
              </p>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Request Body</h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Param</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Required</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <ParamRow name="plugin" type="string" required description='Slug of the expert plugin to query (e.g. "structural-eng-v1")' />
                    <ParamRow name="query" type="string" required description="The domain question to ask. Max 4,000 characters." />
                    <ParamRow name="stream" type="boolean" description="Set to true to receive SSE streaming response. Also enabled by Accept: text/event-stream header." />
                    <ParamRow name="context" type="array" description='Conversation history for multi-turn dialogues. Array of { role: "user" | "assistant", content: string } objects.' />
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Example Request</h3>
              <CodeBlock
                language="bash"
                code={`curl -X POST https://dawk-ps2.vercel.app/api/v1/query \\
  -H "Authorization: Bearer lx_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "plugin": "structural-eng-v1",
    "query": "What is the minimum cover for a beam in severe exposure?"
  }'`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Multi-Turn Conversation</h3>
              <CodeBlock
                language="bash"
                code={`curl -X POST https://dawk-ps2.vercel.app/api/v1/query \\
  -H "Authorization: Bearer lx_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "plugin": "structural-eng-v1",
    "query": "What about for a column instead?",
    "context": [
      { "role": "user", "content": "What is the minimum cover for a beam in severe exposure?" },
      { "role": "assistant", "content": "According to IS 456 Table 16, the minimum nominal cover for a beam in severe exposure is 45mm." }
    ]
  }'`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Streaming Request</h3>
              <CodeBlock
                language="bash"
                code={`curl -X POST https://dawk-ps2.vercel.app/api/v1/query \\
  -H "Authorization: Bearer lx_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -H "Accept: text/event-stream" \\
  -d '{
    "plugin": "structural-eng-v1",
    "query": "What is the minimum cover for a beam in severe exposure?",
    "stream": true
  }'`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">JSON Response</h3>
              <CodeBlock
                language="json"
                code={`{
  "answer": "According to IS 456 Table 16, the minimum nominal cover for a beam in severe exposure is 45mm. [Source 1]",
  "citations": [
    {
      "id": "chunk_abc123",
      "document": "IS-456-2000.pdf",
      "page": 34,
      "section": "Table 16 — Nominal Cover",
      "excerpt": "For severe exposure conditions, beams require 45mm minimum cover..."
    }
  ],
  "decisionPath": [
    { "step": 1, "node": "q1", "label": "Member Type", "value": "beam" },
    { "step": 2, "node": "q2", "label": "Exposure Class", "value": "severe" },
    { "step": 3, "node": "a1", "label": "Cover Recommendation", "result": "45mm nominal cover" }
  ],
  "confidence": "high",
  "pluginVersion": "1"
}`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">SSE Stream Events</h3>
              <p className="mb-3 text-[13px] text-[#777]">When streaming is enabled, events are delivered as Server-Sent Events:</p>
              <CodeBlock
                language="text"
                code={`data: {"type":"status","status":"retrieving","message":"Found 5 relevant sources","sourceCount":5}

data: {"type":"delta","text":"According to "}

data: {"type":"delta","text":"IS 456 Table 16..."}

data: {"type":"done","answer":"...full answer...","citations":[...],"decisionPath":[...],"confidence":"high","pluginVersion":"1"}`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Response Fields</h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Field</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <tr className="border-b border-[#1a1a1a]">
                      <td className="px-4 py-3"><code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">answer</code></td>
                      <td className="px-4 py-3 text-[13px] text-[#888]">string</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">The expert answer with inline [Source N] citations</td>
                    </tr>
                    <tr className="border-b border-[#1a1a1a]">
                      <td className="px-4 py-3"><code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">citations</code></td>
                      <td className="px-4 py-3 text-[13px] text-[#888]">Citation[]</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Array of source references with document, page, section, and excerpt</td>
                    </tr>
                    <tr className="border-b border-[#1a1a1a]">
                      <td className="px-4 py-3"><code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">decisionPath</code></td>
                      <td className="px-4 py-3 text-[13px] text-[#888]">DecisionStep[]</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Steps the decision tree walked to reach the answer</td>
                    </tr>
                    <tr className="border-b border-[#1a1a1a]">
                      <td className="px-4 py-3"><code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">confidence</code></td>
                      <td className="px-4 py-3 text-[13px] text-[#888]">&quot;high&quot; | &quot;medium&quot; | &quot;low&quot;</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Hallucination guard score. Low = answer was refused/replaced.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">pluginVersion</code></td>
                      <td className="px-4 py-3 text-[13px] text-[#888]">string</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Plugin version at time of query (for audit trails)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Error Responses</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-md border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2.5">
                  <StatusBadge code={401} color="red" />
                  <span className="text-[13px] text-[#999]">Missing or invalid API key</span>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2.5">
                  <StatusBadge code={400} color="yellow" />
                  <span className="text-[13px] text-[#999]">Missing <code className="text-[#bbb]">plugin</code> or <code className="text-[#bbb]">query</code>, or query exceeds 4,000 chars</span>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2.5">
                  <StatusBadge code={404} color="blue" />
                  <span className="text-[13px] text-[#999]">Plugin not found or access denied (not published and not owned by key holder)</span>
                </div>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Collaborate Endpoint ── */}
            <section id="collaborate" className="scroll-mt-20">
              <div className="flex items-center gap-3">
                <MethodBadge method="POST" />
                <h2 className="text-2xl font-bold text-white">/api/v1/collaborate</h2>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Multi-expert adversarial reasoning. Send a query to multiple expert plugins simultaneously —
                they deliberate across rounds, critique each other, and an AI moderator synthesizes a final consensus.
                Supports three modes: <strong className="text-white">debate</strong> (multi-round adversarial),{" "}
                <strong className="text-white">consensus</strong> (single round + synthesis), and{" "}
                <strong className="text-white">review</strong> (one leads, others critique).
              </p>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Request Body</h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Param</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Required</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <ParamRow name="experts" type="string[]" required description='Array of 2–5 plugin slugs (e.g. ["structural-eng-v1", "geotech-v1"])' />
                    <ParamRow name="query" type="string" required description="The domain question. Max 4,000 characters." />
                    <ParamRow name="mode" type="string" description='"debate" (default), "consensus", or "review". Controls deliberation strategy.' />
                    <ParamRow name="maxRounds" type="number" description="Max deliberation rounds (1–3). Default: 3." />
                    <ParamRow name="stream" type="boolean" description="Set to true for SSE streaming. Also enabled by Accept: text/event-stream header." />
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Example Request</h3>
              <CodeBlock
                language="bash"
                code={`curl -X POST https://dawk-ps2.vercel.app/api/v1/collaborate \\
  -H "Authorization: Bearer lx_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "experts": ["structural-eng-v1", "geotech-v1"],
    "query": "What foundation type is best for a 5-story building on expansive clay soil?",
    "mode": "debate",
    "maxRounds": 2
  }'`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">JSON Response</h3>
              <CodeBlock
                language="json"
                code={`{
  "rounds": [
    {
      "roundNumber": 1,
      "responses": [
        {
          "pluginSlug": "structural-eng-v1",
          "pluginName": "Structural Engineering Expert",
          "domain": "Structural Engineering",
          "answer": "For a 5-story building on expansive clay...",
          "citations": [...],
          "confidence": "high",
          "revised": false
        },
        {
          "pluginSlug": "geotech-v1",
          "pluginName": "Geotechnical Expert",
          "domain": "Geotechnical Engineering",
          "answer": "Expansive clay soils require...",
          "citations": [...],
          "confidence": "high",
          "revised": false
        }
      ]
    }
  ],
  "consensus": {
    "answer": "Both experts agree that a mat/raft foundation is recommended...",
    "confidence": "high",
    "agreementLevel": 0.85,
    "citations": [...],
    "conflicts": [
      {
        "topic": "Pile depth requirements",
        "positions": [
          { "expert": "structural-eng-v1", "stance": "Minimum 15m driven piles" },
          { "expert": "geotech-v1", "stance": "12m bored piles sufficient" }
        ],
        "resolved": true,
        "resolution": "Bored piles at 12-15m depth recommended pending soil investigation"
      }
    ],
    "expertContributions": [
      { "expert": "structural-eng-v1", "domain": "Structural Engineering", "keyPoints": ["Load analysis", "Foundation sizing"] },
      { "expert": "geotech-v1", "domain": "Geotechnical Engineering", "keyPoints": ["Soil bearing capacity", "Settlement analysis"] }
    ]
  },
  "latencyMs": 12450
}`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">SSE Stream Events</h3>
              <p className="mb-3 text-[13px] text-[#777]">Streaming delivers real-time progress through the deliberation:</p>
              <CodeBlock
                language="text"
                code={`data: {"type":"status","status":"resolving","message":"Resolving expert plugins..."}

data: {"type":"experts_resolved","experts":[{"slug":"structural-eng-v1","name":"Structural Engineering Expert","domain":"Structural Engineering","sourceCount":42,"hasDecisionTree":true},{"slug":"geotech-v1",...}]}

data: {"type":"round_start","round":1,"totalRounds":2}

data: {"type":"expert_thinking","expert":"structural-eng-v1","expertName":"Structural Engineering Expert","domain":"Structural Engineering","message":"Analyzing with 42 sources..."}

data: {"type":"expert_response","round":1,"expert":"structural-eng-v1","expertName":"Structural Engineering Expert","domain":"Structural Engineering","answer":"...","citations":[...],"confidence":"high","revised":false}

data: {"type":"round_complete","round":1}

data: {"type":"done","rounds":[...],"consensus":{...},"latencyMs":12450}`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Collaboration Modes</h3>
              <div className="space-y-3">
                <div className="rounded-md border border-[#262626] bg-[#111] p-4">
                  <p className="text-[13px] font-semibold text-white">debate</p>
                  <p className="mt-1 text-[13px] text-[#999]">Multi-round adversarial. Each expert independently answers, then in subsequent rounds they see all prior responses and can revise their positions. An AI moderator synthesizes the final consensus.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-4">
                  <p className="text-[13px] font-semibold text-white">consensus</p>
                  <p className="mt-1 text-[13px] text-[#999]">Single round only. All experts answer independently, then the moderator synthesizes a consensus without further deliberation.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-4">
                  <p className="text-[13px] font-semibold text-white">review</p>
                  <p className="mt-1 text-[13px] text-[#999]">One expert leads with a full answer, the remaining experts critique and suggest revisions. Best for getting peer review on a primary expert&apos;s analysis.</p>
                </div>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Error Responses</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-md border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2.5">
                  <StatusBadge code={401} color="red" />
                  <span className="text-[13px] text-[#999]">Missing or invalid API key</span>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2.5">
                  <StatusBadge code={400} color="yellow" />
                  <span className="text-[13px] text-[#999]">Fewer than 2 experts, more than 5 experts, invalid mode, or query exceeds 4,000 chars</span>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2.5">
                  <StatusBadge code={404} color="blue" />
                  <span className="text-[13px] text-[#999]">One or more expert plugins not found or access denied</span>
                </div>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Plugins ── */}
            <section id="plugins" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Plugins</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                CRUD endpoints for managing expert plugins. All require Clerk session auth (dashboard use only).
              </p>

              <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">List all plugins owned by the authenticated user, ordered by creation date (newest first).</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response</h4>
                <p className="mt-1 text-[13px] text-[#777]">Array of plugin objects with all fields (id, name, slug, domain, description, systemPrompt, citationMode, version, isPublished, config, createdAt, updatedAt).</p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Create a new expert plugin. A unique slug is auto-generated from the name.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Request Body</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="name" type="string" required description="Display name of the plugin" />
                      <ParamRow name="domain" type="string" required description='Domain/field of expertise (e.g. "Structural Engineering")' />
                      <ParamRow name="systemPrompt" type="string" required description="Expert persona prompt for the LLM" />
                      <ParamRow name="description" type="string" description="Optional description of the plugin" />
                      <ParamRow name="citationMode" type="string" description='"mandatory" (default) or "optional"' />
                    </tbody>
                  </table>
                </div>
                <CodeBlock
                  language="json"
                  code={`{
  "name": "Structural Engineering Expert",
  "domain": "Structural Engineering",
  "systemPrompt": "You are an expert structural engineer specializing in IS 456 code compliance...",
  "description": "Expert on IS 456 concrete design standards",
  "citationMode": "mandatory"
}`}
                />
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Get a single plugin by UUID, including its related knowledge documents and decision trees. Must be the plugin owner.</p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="PUT" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Update a plugin. Supports partial updates — only send the fields you want to change.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Updatable Fields</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="name" type="string" description="New display name" />
                      <ParamRow name="description" type="string" description="New description" />
                      <ParamRow name="domain" type="string" description="New domain" />
                      <ParamRow name="systemPrompt" type="string" description="New system prompt" />
                      <ParamRow name="citationMode" type="string" description='"mandatory" or "optional"' />
                      <ParamRow name="isPublished" type="boolean" description="Publish/unpublish the plugin" />
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="DELETE" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Delete a plugin and all associated data (documents, chunks, decision trees) via cascade. Must be the plugin owner.</p>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Knowledge Documents ── */}
            <section id="documents" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Knowledge Documents</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Upload reference documents to a plugin&apos;s knowledge base. Documents are automatically chunked and embedded for vector similarity search.
              </p>

              <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/documents</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">List all knowledge documents for a plugin. Requires ownership.</p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/documents</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">
                  Upload a document. Accepts <code className="text-[#bbb]">multipart/form-data</code>.
                  The document is chunked, embedded with OpenAI text-embedding-3-small (1536 dimensions), and stored for pgvector retrieval.
                </p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Form Fields</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="file" type="File" description="A PDF, markdown, or text file to upload" />
                      <ParamRow name="text" type="string" description="Alternatively, send raw text content directly" />
                      <ParamRow name="fileName" type="string" description="Override the file name (defaults to uploaded file name)" />
                      <ParamRow name="fileType" type="string" description='Document type: "pdf", "markdown", etc. (defaults to "markdown")' />
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[13px] text-[#777]">Either <code className="text-[#bbb]">file</code> or <code className="text-[#bbb]">text</code> must be provided.</p>

                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response (201)</h4>
                <CodeBlock
                  language="json"
                  code={`{
  "id": "doc_uuid",
  "pluginId": "plugin_uuid",
  "fileName": "IS-456-2000.pdf",
  "fileType": "pdf",
  "rawText": "...",
  "metadata": null,
  "createdAt": "2026-02-28T...",
  "chunksCreated": 42
}`}
                />
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="DELETE" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/documents?docId=...</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Delete a document and all its chunks (cascade). Requires <code className="text-[#bbb]">docId</code> query param.</p>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Decision Trees ── */}
            <section id="trees" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Decision Trees</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Decision trees add structured reasoning on top of RAG retrieval. Define condition/question/action nodes as JSON, and the engine walks the tree during each query.
                The decision path is included in every query response, giving full auditability of the reasoning chain.
              </p>

              <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/trees</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">List all decision trees for a plugin. Returns an array of tree objects with id, name, description, treeData, isActive, and createdAt.</p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/trees</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Create a new decision tree for the plugin.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Request Body</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="name" type="string" required description="Name of the decision tree" />
                      <ParamRow name="treeData" type="object" required description="JSON decision graph (see structure below)" />
                      <ParamRow name="description" type="string" description="Optional description" />
                    </tbody>
                  </table>
                </div>

                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Tree Data Structure</h4>
                <CodeBlock
                  language="json"
                  code={`{
  "rootNodeId": "q1",
  "nodes": {
    "q1": {
      "type": "question",
      "label": "Member Type",
      "question": { "text": "What type of member?", "options": ["beam", "column", "slab"], "extractFrom": "member_type" },
      "childrenByAnswer": { "beam": "q2", "column": "q3", "slab": "a3" }
    },
    "q2": {
      "type": "condition",
      "label": "Check Exposure",
      "condition": { "field": "exposure", "operator": "eq", "value": "severe" },
      "trueChildId": "a2",
      "falseChildId": "a1"
    },
    "a1": {
      "type": "action",
      "label": "Cover Recommendation",
      "action": { "recommendation": "20mm nominal cover", "severity": "info" }
    },
    "a2": {
      "type": "action",
      "label": "Cover Recommendation",
      "action": { "recommendation": "45mm nominal cover", "severity": "warning" }
    }
  }
}`}
                />

                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Node Types</h4>
                <div className="mt-2 space-y-2">
                  <div className="rounded border border-[#262626] bg-[#0d0d0d] p-3">
                    <p className="text-[13px] font-semibold text-white">condition</p>
                    <p className="mt-1 text-[13px] text-[#777]">Evaluates a field with an operator (eq, gt, lt, contains, in). Branches to <code className="text-[#bbb]">trueChildId</code> or <code className="text-[#bbb]">falseChildId</code>.</p>
                  </div>
                  <div className="rounded border border-[#262626] bg-[#0d0d0d] p-3">
                    <p className="text-[13px] font-semibold text-white">question</p>
                    <p className="mt-1 text-[13px] text-[#777]">Extracts an answer from the query parameters. Routes to the matching child in <code className="text-[#bbb]">childrenByAnswer</code>.</p>
                  </div>
                  <div className="rounded border border-[#262626] bg-[#0d0d0d] p-3">
                    <p className="text-[13px] font-semibold text-white">action</p>
                    <p className="mt-1 text-[13px] text-[#777]">Terminal node. Returns a recommendation with optional severity and sourceHint. Ends the tree walk.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/trees/:treeId</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Get a single decision tree by ID. Returns the full tree object including treeData.</p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="PUT" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/trees/:treeId</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Update a decision tree. Supports partial updates.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Updatable Fields</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="name" type="string" description="New tree name" />
                      <ParamRow name="description" type="string" description="New description" />
                      <ParamRow name="treeData" type="object" description="Updated decision graph JSON" />
                      <ParamRow name="isActive" type="boolean" description="Activate/deactivate the tree" />
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="DELETE" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/trees/:treeId</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Delete a decision tree permanently.</p>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Collaboration Rooms ── */}
            <section id="collab-rooms" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Collaboration Rooms</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Persistent rooms for multi-expert collaboration sessions. Create a room with a set of experts, then run multiple queries against it.
                Sessions are stored with full round history and consensus results. All endpoints require Clerk session auth.
              </p>

              <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/collaboration-rooms</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">List all collaboration rooms owned by the authenticated user. Returns rooms with session counts and resolved expert names.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response</h4>
                <CodeBlock
                  language="json"
                  code={`[
  {
    "id": "room_uuid",
    "name": "Foundation Design Panel",
    "mode": "debate",
    "expertSlugs": ["structural-eng-v1", "geotech-v1"],
    "maxRounds": 3,
    "createdAt": "2026-02-28T...",
    "updatedAt": "2026-02-28T...",
    "sessionCount": 5,
    "expertNames": ["Structural Engineering Expert", "Geotechnical Expert"]
  }
]`}
                />
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="text-[14px] font-semibold text-white">/api/collaboration-rooms</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Create a new collaboration room.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Request Body</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="name" type="string" required description="Room display name" />
                      <ParamRow name="expertSlugs" type="string[]" required description="Array of 2–5 expert plugin slugs" />
                      <ParamRow name="mode" type="string" description='"debate" (default), "consensus", or "review"' />
                      <ParamRow name="maxRounds" type="number" description="Max deliberation rounds (1–3). Default: 3." />
                    </tbody>
                  </table>
                </div>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response (201)</h4>
                <CodeBlock
                  language="json"
                  code={`{
  "id": "room_uuid",
  "creatorId": "user_uuid",
  "name": "Foundation Design Panel",
  "mode": "debate",
  "expertSlugs": ["structural-eng-v1", "geotech-v1"],
  "maxRounds": 3,
  "createdAt": "2026-02-28T...",
  "updatedAt": "2026-02-28T..."
}`}
                />
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/collaboration-rooms/:id</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Get a room with its expert details (slug, name, domain) and all collaboration sessions ordered by most recent.</p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="DELETE" />
                  <code className="text-[14px] font-semibold text-white">/api/collaboration-rooms/:id</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Delete a collaboration room and all its sessions (cascade).</p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="text-[14px] font-semibold text-white">/api/collaboration-rooms/sandbox</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Run a collaboration query inside a room. Creates a new session, runs the multi-expert deliberation, and streams results as SSE. The session is persisted with rounds, consensus, and latency.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Request Body</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="roomId" type="string" required description="UUID of the collaboration room" />
                      <ParamRow name="query" type="string" required description="The question to ask the expert panel" />
                    </tbody>
                  </table>
                </div>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response</h4>
                <p className="mt-1 text-[13px] text-[#777]">SSE stream with the same event types as <code className="text-[#bbb]">/api/v1/collaborate</code> — status, experts_resolved, round_start, expert_thinking, expert_response, round_complete, done.</p>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── API Keys ── */}
            <section id="api-keys" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">API Keys</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Manage API keys for authenticating external agent calls. Keys are prefixed with <code className="text-[#bbb]">lx_</code> and stored as salted hashes. All endpoints require Clerk session auth.
              </p>

              <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/api-keys</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">List all API keys for the authenticated user. Returns id, name, key prefix (first 8 chars), last used timestamp, and created timestamp. Never returns the full key.</p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="text-[14px] font-semibold text-white">/api/api-keys</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Generate a new API key. The full key is returned <strong className="text-white">only once</strong> in the response — store it securely.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Request Body</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="name" type="string" required description='A label for this key (e.g. "production", "my-agent")' />
                    </tbody>
                  </table>
                </div>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response (201)</h4>
                <CodeBlock
                  language="json"
                  code={`{
  "key": "lx_a1b2c3d4e5f6g7h8i9j0...",
  "prefix": "lx_a1b2c",
  "name": "production"
}`}
                />
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="PATCH" />
                  <code className="text-[14px] font-semibold text-white">/api/api-keys</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Decrypt and reveal the full API key (requires ownership). Body: <code className="text-[#bbb]">{`{ "id": "key_uuid" }`}</code></p>
              </div>

              <div className="mt-4 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="DELETE" />
                  <code className="text-[14px] font-semibold text-white">/api/api-keys?id=...</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Delete an API key. Detaches it from query logs before removal. Requires <code className="text-[#bbb]">id</code> query param.</p>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Sandbox ── */}
            <section id="sandbox" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Sandbox</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Test your plugin&apos;s query pipeline without publishing. Uses Clerk session auth — available from the dashboard only.
              </p>

              <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="text-[14px] font-semibold text-white">/api/sandbox/:pluginId</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Run a test query against an unpublished (or published) plugin you own. Same pipeline as the production query endpoint, but bypasses the publish check. Returns SSE stream.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Request Body</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <ParamRow name="query" type="string" required description="The question to test" />
                    </tbody>
                  </table>
                </div>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response</h4>
                <p className="mt-1 text-[13px] text-[#777]">SSE stream with the same event types as <code className="text-[#bbb]">/api/v1/query</code> — status, delta, done, error.</p>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Plugin Export ── */}
            <section id="export" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Plugin Export</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Export a plugin as a JSON file containing the full plugin definition, all knowledge documents (with raw text), and all decision trees.
              </p>

              <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/plugins/:id/export</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Download a complete plugin export as a JSON file attachment. Requires Clerk session auth and plugin ownership.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response Headers</h4>
                <CodeBlock
                  language="http"
                  code={`Content-Type: application/json; charset=utf-8
Content-Disposition: attachment; filename="structural-eng-v1.json"`}
                />
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response Body</h4>
                <CodeBlock
                  language="json"
                  code={`{
  "version": 1,
  "exportedAt": "2026-02-28T...",
  "plugin": {
    "id": "uuid",
    "name": "Structural Engineering Expert",
    "slug": "structural-eng-v1",
    "description": "...",
    "domain": "Structural Engineering",
    "systemPrompt": "...",
    "citationMode": "mandatory",
    "isPublished": true,
    "config": {},
    "createdAt": "...",
    "updatedAt": "..."
  },
  "documents": [
    {
      "id": "doc_uuid",
      "fileName": "IS-456-2000.pdf",
      "fileType": "pdf",
      "rawText": "...",
      "metadata": {},
      "createdAt": "..."
    }
  ],
  "decisionTrees": [
    {
      "id": "tree_uuid",
      "name": "Cover Determination",
      "description": "...",
      "treeData": { "rootNodeId": "q1", "nodes": {...} },
      "isActive": true,
      "createdAt": "..."
    }
  ]
}`}
                />
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Marketplace ── */}
            <section id="marketplace" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Marketplace</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Download shared plugins from the marketplace. Plugins must be published and have <code className="text-[#bbb]">config.marketplaceShared</code> set to <code className="text-[#bbb]">true</code> to be downloadable.
              </p>

              <div className="mt-8 rounded-md border border-[#262626] bg-[#111] p-5">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="text-[14px] font-semibold text-white">/api/marketplace/:slug/download</code>
                </div>
                <p className="mt-3 text-[13px] text-[#999]">Download a marketplace-shared plugin as a JSON file. Requires Clerk session auth. Returns the same structure as plugin export, plus a <code className="text-[#bbb]">source: &quot;marketplace&quot;</code> field and the creator&apos;s display name.</p>
                <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Response (200)</h4>
                <CodeBlock
                  language="json"
                  code={`{
  "version": 1,
  "exportedAt": "2026-02-28T...",
  "source": "marketplace",
  "plugin": {
    "id": "uuid",
    "name": "Structural Engineering Expert",
    "slug": "structural-eng-v1",
    "creator": "John Doe",
    ...
  },
  "documents": [...],
  "decisionTrees": [...]
}`}
                />
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── SDK Reference ── */}
            <section id="sdk" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">SDK Reference</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                The TypeScript SDK wraps the REST API with type-safe methods, streaming support, conversation context, timeout handling, and framework adapters.
              </p>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Installation</h3>
              <CodeBlock language="bash" code="npm install lexic-sdk" />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Quick Start</h3>
              <CodeBlock
                language="typescript"
                code={`import { Lexic } from "lexic-sdk";

const lexic = new Lexic({
  apiKey: "lx_your_api_key",
  defaultPlugin: "structural-eng-v1",
});

const result = await lexic.query({
  query: "Minimum cover for a beam in severe exposure?",
});

console.log(result.answer);       // Cited expert answer
console.log(result.citations);    // Source references
console.log(result.confidence);   // "high" | "medium" | "low"
console.log(result.decisionPath); // Decision tree steps`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Constructor: <code className="normal-case text-white">new Lexic(config)</code></h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Param</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Required</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <ParamRow name="apiKey" type="string" required description="Your Lexic API key (starts with lx_)" />
                    <ParamRow name="baseUrl" type="string" description='Override the API base URL. Default: "https://dawk-ps2.vercel.app"' />
                    <ParamRow name="defaultPlugin" type="string" description="Default plugin slug for all queries" />
                    <ParamRow name="timeout" type="number" description="Request timeout in ms. Default: 30000" />
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Methods</h3>

              <div className="space-y-4">
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">query(options): Promise&lt;QueryResult&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">Send a question to an expert plugin. Returns a full result with answer, citations, decision path, and confidence.</p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody>
                        <ParamRow name="options.plugin" type="string" description="Plugin slug (overrides activePlugin for this call)" />
                        <ParamRow name="options.query" type="string" required description="The domain question" />
                        <ParamRow name="options.context" type="array" description='Conversation history: [{ role: "user" | "assistant", content: string }]' />
                        <ParamRow name="options.options" type="QueryRequestOptions" description="Per-request options (see below)" />
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">queryStream(options): AsyncGenerator&lt;StreamEvent&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">Stream a query response as an async generator. Yields status, delta (text chunks), and done events. Same options as <code className="text-[#bbb]">query()</code>.</p>
                  <CodeBlock
                    language="typescript"
                    code={`for await (const event of lexic.queryStream({ query: "..." })) {
  if (event.type === "delta") process.stdout.write(event.text);
  if (event.type === "done") console.log("\\nConfidence:", event.confidence);
}`}
                  />
                </div>

                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">queryStreamToResult(options, onEvent?): Promise&lt;QueryResult&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">Streams a query but collects the final result as a <code className="text-[#bbb]">QueryResult</code>. Pass an optional <code className="text-[#bbb]">onEvent</code> callback to handle intermediate events (deltas, status updates).</p>
                  <CodeBlock
                    language="typescript"
                    code={`const result = await lexic.queryStreamToResult(
  { query: "..." },
  (event) => {
    if (event.type === "delta") process.stdout.write(event.text);
  },
);
console.log(result.citations);`}
                  />
                </div>

                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">setActivePlugin(slug): void</code>
                  <p className="mt-2 text-[13px] text-[#999]">Hot-swap the active plugin. All subsequent <code className="text-[#bbb]">query()</code> calls will use this plugin unless overridden.</p>
                </div>

                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">getActivePlugin(): string | null</code>
                  <p className="mt-2 text-[13px] text-[#999]">Returns the currently active plugin slug, or null if none is set.</p>
                </div>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Query Request Options</h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Param</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <tr>
                      <td className="px-4 py-3"><code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">citationMode</code></td>
                      <td className="px-4 py-3 text-[13px] text-[#888]">&quot;inline&quot; | &quot;footnote&quot; | &quot;off&quot;</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">How citations appear in the answer text</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">maxSources</code></td>
                      <td className="px-4 py-3 text-[13px] text-[#888]">number</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Maximum number of knowledge chunks to retrieve</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-emerald-400">includeDecisionPath</code></td>
                      <td className="px-4 py-3 text-[13px] text-[#888]">boolean</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Whether to include the decision tree path in the response</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Hot-Swap Example</h3>
              <CodeBlock
                language="typescript"
                code={`const lexic = new Lexic({ apiKey: "lx_..." });

// Query the structural engineering expert
lexic.setActivePlugin("structural-eng-v1");
const structResult = await lexic.query({
  query: "Max allowable deflection for a cantilever?",
});

// Instantly switch to a different domain expert
lexic.setActivePlugin("electrical-code-v2");
const elecResult = await lexic.query({
  query: "Wire sizing for a 30A circuit?",
});`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Multi-Turn Conversation</h3>
              <CodeBlock
                language="typescript"
                code={`const result1 = await lexic.query({
  query: "What is the minimum cover for a beam in severe exposure?",
});

const result2 = await lexic.query({
  query: "What about for a column instead?",
  context: [
    { role: "user", content: "What is the minimum cover for a beam in severe exposure?" },
    { role: "assistant", content: result1.answer },
  ],
});`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Error Handling</h3>
              <CodeBlock
                language="typescript"
                code={`import { Lexic, LexicAPIError } from "lexic-sdk";

try {
  const result = await lexic.query({ query: "..." });
} catch (err) {
  if (err instanceof LexicAPIError) {
    console.error(err.message); // "Plugin not found or access denied"
    console.error(err.status);  // 404
  }
}`}
              />
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── SDK Collaboration ── */}
            <section id="sdk-collab" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">SDK Collaboration</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                The SDK includes full support for multi-expert collaboration — the same adversarial reasoning available via the REST API, with typed methods and streaming.
              </p>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Methods</h3>

              <div className="space-y-4">
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">collaborate(options): Promise&lt;CollaborationResult&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">Run a multi-expert collaboration. Returns full results with all rounds, expert responses, and consensus synthesis.</p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody>
                        <ParamRow name="options.experts" type="string[]" required description="Array of 2–5 expert plugin slugs" />
                        <ParamRow name="options.query" type="string" required description="The domain question" />
                        <ParamRow name="options.mode" type="string" description='"debate" (default), "consensus", or "review"' />
                        <ParamRow name="options.maxRounds" type="number" description="Max deliberation rounds (1–3). Default: 3." />
                      </tbody>
                    </table>
                  </div>
                  <CodeBlock
                    language="typescript"
                    code={`const result = await lexic.collaborate({
  experts: ["structural-eng-v1", "geotech-v1"],
  query: "Best foundation for a 5-story building on clay?",
  mode: "debate",
  maxRounds: 2,
});

console.log(result.consensus.answer);        // Synthesized answer
console.log(result.consensus.agreementLevel); // 0.0–1.0
console.log(result.consensus.conflicts);     // Disagreements
console.log(result.rounds);                  // Full deliberation history
console.log(result.latencyMs);               // Total time`}
                  />
                </div>

                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">collaborateStream(options): AsyncGenerator&lt;CollaborationStreamEvent&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">Stream a collaboration as an async generator. Yields real-time events as experts deliberate.</p>
                  <CodeBlock
                    language="typescript"
                    code={`for await (const event of lexic.collaborateStream({
  experts: ["structural-eng-v1", "geotech-v1"],
  query: "Best foundation for a 5-story building on clay?",
})) {
  switch (event.type) {
    case "experts_resolved":
      console.log("Experts:", event.experts.map(e => e.name));
      break;
    case "expert_thinking":
      console.log(\`\${event.expertName} is analyzing...\`);
      break;
    case "expert_response":
      console.log(\`\${event.expertName} (Round \${event.round}):\`, event.answer);
      break;
    case "done":
      console.log("Consensus:", event.consensus.answer);
      break;
  }
}`}
                  />
                </div>

                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">collaborateStreamToResult(options, onEvent?): Promise&lt;CollaborationResult&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">Streams a collaboration but collects the final result. Pass an optional <code className="text-[#bbb]">onEvent</code> callback for intermediate events.</p>
                  <CodeBlock
                    language="typescript"
                    code={`const result = await lexic.collaborateStreamToResult(
  {
    experts: ["structural-eng-v1", "geotech-v1"],
    query: "Best foundation for a 5-story building on clay?",
  },
  (event) => {
    if (event.type === "expert_thinking") {
      console.log(\`\${event.expertName}: \${event.message}\`);
    }
  },
);
console.log(result.consensus);`}
                  />
                </div>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── LangChain ── */}
            <section id="langchain" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">LangChain Adapter</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Drop Lexic into any LangChain agent as a tool. Zero-dependency wrapper — doesn&apos;t require <code className="text-[#bbb]">langchain</code> as a peer dependency.
                Includes both single-expert and multi-expert collaboration tools.
              </p>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Installation</h3>
              <CodeBlock language="bash" code="npm install lexic-sdk" />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Single-Expert Tool</h3>
              <CodeBlock
                language="typescript"
                code={`import { LexicTool } from "lexic-sdk/langchain";

const tool = new LexicTool({
  apiKey: "lx_your_api_key",
  plugin: "structural-eng-v1",
  name: "structural_expert",
  description: "Consult a structural engineering expert",
  queryOptions: {
    citationMode: "inline",
    maxSources: 5,
    includeDecisionPath: true,
  },
});

// Add to any LangChain agent
const agent = createOpenAIToolsAgent({ llm, tools: [tool], prompt });

// Hot-swap to a different expert
tool.setPlugin("electrical-code-v2");`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Constructor: <code className="normal-case text-white">new LexicTool(config)</code></h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Param</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Required</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <ParamRow name="apiKey" type="string" required description="Lexic API key" />
                    <ParamRow name="plugin" type="string" required description="Plugin slug to query" />
                    <ParamRow name="baseUrl" type="string" description="Override API base URL" />
                    <ParamRow name="name" type="string" description='LangChain tool name. Default: "lexic_{slug}"' />
                    <ParamRow name="description" type="string" description="LangChain tool description shown to the LLM" />
                    <ParamRow name="queryOptions" type="QueryRequestOptions" description="Default query options (citationMode, maxSources, includeDecisionPath)" />
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Methods</h3>
              <div className="space-y-4">
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">call(input: string): Promise&lt;string&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">LangChain Tool interface. Takes the agent&apos;s string input, queries the plugin, and returns a JSON string with answer, citations, confidence, and decision path.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">setPlugin(slug: string): void</code>
                  <p className="mt-2 text-[13px] text-[#999]">Hot-swap which plugin this tool queries.</p>
                </div>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Multi-Expert Collaboration Tool</h3>
              <CodeBlock
                language="typescript"
                code={`import { LexicCollaborationTool } from "lexic-sdk/langchain";

const collabTool = new LexicCollaborationTool({
  apiKey: "lx_your_api_key",
  experts: ["structural-eng-v1", "geotech-v1"],
  name: "expert_panel",
  description: "Consult multiple domain experts for adversarial analysis",
  mode: "debate",
  maxRounds: 2,
  onEvent: (event) => {
    if (event.type === "expert_thinking") {
      console.log(\`\${event.expertName}: \${event.message}\`);
    }
  },
});

// Add to LangChain agent alongside single-expert tools
const agent = createOpenAIToolsAgent({
  llm,
  tools: [tool, collabTool],
  prompt,
});

// Dynamically change experts or mode
collabTool.setExperts(["structural-eng-v1", "fire-safety-v1"]);
collabTool.setMode("consensus");`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Constructor: <code className="normal-case text-white">new LexicCollaborationTool(config)</code></h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Param</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Required</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <ParamRow name="apiKey" type="string" required description="Lexic API key" />
                    <ParamRow name="experts" type="string[]" required description="Array of 2–5 expert plugin slugs" />
                    <ParamRow name="baseUrl" type="string" description="Override API base URL" />
                    <ParamRow name="name" type="string" description='LangChain tool name. Default: "lexic_collaboration"' />
                    <ParamRow name="description" type="string" description="Tool description for the LLM agent" />
                    <ParamRow name="mode" type="CollaborationMode" description='"debate" (default), "consensus", or "review"' />
                    <ParamRow name="maxRounds" type="number" description="Max deliberation rounds (1–3). Default: 3." />
                    <ParamRow name="onEvent" type="function" description="Callback for streaming events during collaboration" />
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Collaboration Tool Methods</h3>
              <div className="space-y-4">
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">call(input: string): Promise&lt;string&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">LangChain Tool interface. Returns JSON with consensus answer, conflicts, expert contributions, and agreement level.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">setExperts(slugs: string[]): void</code>
                  <p className="mt-2 text-[13px] text-[#999]">Change the panel of experts at runtime.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">setMode(mode: CollaborationMode): void</code>
                  <p className="mt-2 text-[13px] text-[#999]">Switch between debate, consensus, and review modes.</p>
                </div>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── AutoGPT ── */}
            <section id="autogpt" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">AutoGPT Adapter</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                Register Lexic as an AutoGPT command with typed parameters and execution.
                Includes both single-expert and multi-expert collaboration adapters.
              </p>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Single-Expert Usage</h3>
              <CodeBlock
                language="typescript"
                code={`import { LexicAutoGPT } from "lexic-sdk/autogpt";

const adapter = new LexicAutoGPT({
  apiKey: "lx_your_api_key",
  plugin: "structural-eng-v1",
  commandName: "consult_structural_expert",
  commandDescription: "Ask the structural expert",
  queryOptions: {
    citationMode: "inline",
    maxSources: 5,
    includeDecisionPath: true,
  },
});

// Register as an AutoGPT command
const command = adapter.asCommand();
// command.name, command.description, command.parameters, command.execute

// Or execute directly
const answer = await adapter.execute(
  "What is the minimum reinforcement ratio for a slab?"
);`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Constructor: <code className="normal-case text-white">new LexicAutoGPT(config)</code></h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Param</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Required</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <ParamRow name="apiKey" type="string" required description="Lexic API key" />
                    <ParamRow name="plugin" type="string" required description="Plugin slug to query" />
                    <ParamRow name="baseUrl" type="string" description="Override API base URL" />
                    <ParamRow name="commandName" type="string" description='AutoGPT command name. Default: "consult_{slug}"' />
                    <ParamRow name="commandDescription" type="string" description="Command description for the agent" />
                    <ParamRow name="queryOptions" type="QueryRequestOptions" description="Default query options (citationMode, maxSources, includeDecisionPath)" />
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Methods</h3>
              <div className="space-y-4">
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">asCommand(): AutoGPTCommand</code>
                  <p className="mt-2 text-[13px] text-[#999]">Returns an object with <code className="text-[#bbb]">name</code>, <code className="text-[#bbb]">description</code>, <code className="text-[#bbb]">parameters</code>, and <code className="text-[#bbb]">execute</code> — ready to register with AutoGPT.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">execute(query: string): Promise&lt;string&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">Execute a query directly. Returns a human-readable string with the answer, citations, and decision path.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">setPlugin(slug: string): void</code>
                  <p className="mt-2 text-[13px] text-[#999]">Hot-swap which plugin this adapter queries.</p>
                </div>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Multi-Expert Collaboration</h3>
              <CodeBlock
                language="typescript"
                code={`import { LexicCollaborationAutoGPT } from "lexic-sdk/autogpt";

const collabAdapter = new LexicCollaborationAutoGPT({
  apiKey: "lx_your_api_key",
  experts: ["structural-eng-v1", "geotech-v1"],
  commandName: "consult_expert_panel",
  commandDescription: "Ask multiple domain experts to debate and reach consensus",
  mode: "debate",
  maxRounds: 2,
  onEvent: (event) => {
    if (event.type === "expert_thinking") {
      console.log(\`\${event.expertName}: \${event.message}\`);
    }
  },
});

// Register as AutoGPT command
const command = collabAdapter.asCommand();

// Or execute directly
const answer = await collabAdapter.execute(
  "Best foundation for a 5-story building on clay?"
);

// Change experts or mode at runtime
collabAdapter.setExperts(["structural-eng-v1", "fire-safety-v1"]);
collabAdapter.setMode("consensus");`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Constructor: <code className="normal-case text-white">new LexicCollaborationAutoGPT(config)</code></h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Param</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Type</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Required</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <ParamRow name="apiKey" type="string" required description="Lexic API key" />
                    <ParamRow name="experts" type="string[]" required description="Array of 2–5 expert plugin slugs" />
                    <ParamRow name="baseUrl" type="string" description="Override API base URL" />
                    <ParamRow name="commandName" type="string" description='Command name. Default: "consult_expert_panel"' />
                    <ParamRow name="commandDescription" type="string" description="Command description for the agent" />
                    <ParamRow name="mode" type="CollaborationMode" description='"debate" (default), "consensus", or "review"' />
                    <ParamRow name="maxRounds" type="number" description="Max deliberation rounds (1–3). Default: 3." />
                    <ParamRow name="onEvent" type="function" description="Callback for streaming events during collaboration" />
                  </tbody>
                </table>
              </div>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Collaboration Methods</h3>
              <div className="space-y-4">
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">asCommand(): AutoGPTCommand</code>
                  <p className="mt-2 text-[13px] text-[#999]">Returns an AutoGPT command for the expert panel. Input is the query string.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">execute(query: string): Promise&lt;string&gt;</code>
                  <p className="mt-2 text-[13px] text-[#999]">Execute collaboration directly. Returns human-readable text with consensus, conflicts, and per-expert contributions.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">setExperts(slugs: string[]): void</code>
                  <p className="mt-2 text-[13px] text-[#999]">Change the expert panel at runtime.</p>
                </div>
                <div className="rounded-md border border-[#262626] bg-[#111] p-5">
                  <code className="text-[14px] font-semibold text-white">setMode(mode: CollaborationMode): void</code>
                  <p className="mt-2 text-[13px] text-[#999]">Switch between debate, consensus, and review modes.</p>
                </div>
              </div>
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── TypeScript Types ── */}
            <section id="types" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">TypeScript Types</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                All types are exported from <code className="text-[#bbb]">lexic-sdk</code>. Import them directly for type-safe integrations.
              </p>

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Configuration</h3>
              <CodeBlock
                language="typescript"
                code={`interface LexicConfig {
  apiKey: string;
  baseUrl?: string;
  defaultPlugin?: string;
  timeout?: number;
}

interface QueryRequestOptions {
  citationMode?: "inline" | "footnote" | "off";
  maxSources?: number;
  includeDecisionPath?: boolean;
}

interface QueryOptions {
  plugin?: string;
  query: string;
  context?: Array<{ role: "user" | "assistant"; content: string }>;
  options?: QueryRequestOptions;
}`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Query Response</h3>
              <CodeBlock
                language="typescript"
                code={`interface QueryResult {
  answer: string;
  citations: Citation[];
  decisionPath: DecisionStep[];
  confidence: "high" | "medium" | "low";
  pluginVersion: string;
}

interface Citation {
  id: string;
  document: string;
  page?: number;
  section?: string;
  excerpt: string;
}

interface DecisionStep {
  step: number;
  node: string;
  label: string;
  value?: string;
  result?: string;
}

interface LexicError {
  error: string;
  status?: number;
}`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Stream Events</h3>
              <CodeBlock
                language="typescript"
                code={`type StreamEvent =
  | { type: "status"; status: string; message: string; sourceCount?: number }
  | { type: "delta"; text: string }
  | { type: "done"; answer: string; citations: Citation[];
      decisionPath: DecisionStep[];
      confidence: "high" | "medium" | "low";
      pluginVersion: string }
  | { type: "error"; error: string };`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Collaboration</h3>
              <CodeBlock
                language="typescript"
                code={`type CollaborationMode = "debate" | "consensus" | "review";

interface CollaborateOptions {
  experts: string[];
  query: string;
  mode?: CollaborationMode;
  maxRounds?: number;
}

interface ExpertResponse {
  pluginSlug: string;
  pluginName: string;
  domain: string;
  answer: string;
  citations: Citation[];
  confidence: "high" | "medium" | "low";
  revised: boolean;
  revisionNote?: string;
}

interface CollaborationRound {
  roundNumber: number;
  responses: ExpertResponse[];
}

interface ConflictEntry {
  topic: string;
  positions: Array<{ expert: string; stance: string }>;
  resolved: boolean;
  resolution?: string;
}

interface ConsensusResult {
  answer: string;
  confidence: "high" | "medium" | "low";
  agreementLevel: number;
  citations: Citation[];
  conflicts: ConflictEntry[];
  expertContributions: Array<{
    expert: string;
    domain: string;
    keyPoints: string[];
  }>;
}

interface CollaborationResult {
  rounds: CollaborationRound[];
  consensus: ConsensusResult;
  latencyMs: number;
}`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Collaboration Stream Events</h3>
              <CodeBlock
                language="typescript"
                code={`type CollaborationStreamEvent =
  | { type: "status"; status: string; message: string }
  | { type: "experts_resolved"; experts: Array<{
      slug: string; name: string; domain: string;
      sourceCount: number; hasDecisionTree: boolean
    }> }
  | { type: "round_start"; round: number; totalRounds: number }
  | { type: "expert_thinking"; expert: string;
      expertName: string; domain: string; message: string }
  | { type: "expert_response"; round: number; expert: string;
      expertName: string; domain: string; answer: string;
      citations: Citation[];
      confidence: "high" | "medium" | "low"; revised: boolean }
  | { type: "round_complete"; round: number }
  | { type: "done"; rounds: CollaborationRound[];
      consensus: ConsensusResult; latencyMs: number }
  | { type: "error"; error: string };`}
              />
            </section>

            <hr className="my-14 border-[#1a1a1a]" />

            {/* ── Errors ── */}
            <section id="errors" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-white">Error Reference</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#999]">
                All error responses follow the same shape. The SDK throws <code className="text-[#bbb]">LexicAPIError</code> with a <code className="text-[#bbb]">status</code> property.
              </p>

              <CodeBlock
                language="json"
                code={`{
  "error": "Human-readable error message"
}`}
              />

              <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-widest text-[#555]">Status Codes</h3>
              <div className="overflow-x-auto rounded-md border border-[#262626]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#111]">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Code</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">Meaning</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#555]">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <tr>
                      <td className="px-4 py-3"><StatusBadge code={200} color="green" /></td>
                      <td className="px-4 py-3 text-[13px] text-white">OK</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Successful request</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><StatusBadge code={201} color="green" /></td>
                      <td className="px-4 py-3 text-[13px] text-white">Created</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Resource successfully created (plugin, document, key, tree, room)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><StatusBadge code={400} color="yellow" /></td>
                      <td className="px-4 py-3 text-[13px] text-white">Bad Request</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Missing required fields, invalid JSON, query too long, &lt;2 or &gt;5 experts, invalid mode</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><StatusBadge code={401} color="red" /></td>
                      <td className="px-4 py-3 text-[13px] text-white">Unauthorized</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Missing/invalid API key or Clerk session</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><StatusBadge code={403} color="red" /></td>
                      <td className="px-4 py-3 text-[13px] text-white">Forbidden</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Plugin not published (for external query/collaborate endpoints)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><StatusBadge code={404} color="blue" /></td>
                      <td className="px-4 py-3 text-[13px] text-white">Not Found</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Plugin, document, tree, room, or API key not found</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><StatusBadge code={408} color="yellow" /></td>
                      <td className="px-4 py-3 text-[13px] text-white">Timeout</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">SDK request exceeded timeout (default 30s)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><StatusBadge code={500} color="red" /></td>
                      <td className="px-4 py-3 text-[13px] text-white">Server Error</td>
                      <td className="px-4 py-3 text-[13px] text-[#999]">Internal error (LLM failure, database error, etc.)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Footer CTA */}
            <div className="mt-20 rounded-md border border-[#262626] bg-[#111] p-8 text-center">
              <h3 className="text-xl font-bold text-white">Ready to integrate?</h3>
              <p className="mt-2 text-[14px] text-[#999]">Create your first plugin and start querying in under 5 minutes.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button className="bg-white text-black hover:bg-[#ccc] font-semibold" asChild>
                  <Link href="/sign-up">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-[#333] text-[#ededed] hover:bg-[#1a1a1a]" asChild>
                  <Link href="https://github.com/retrogtx/dawk-ps2/tree/main/packages/sdk" target="_blank">
                    View SDK on GitHub
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-12 pb-10 text-center text-[12px] text-[#444]">
              Lexic HDK v0.1.0 — Built for HackX 2026
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
