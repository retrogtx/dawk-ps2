# lexic-sdk

TypeScript SDK for [Lexic](https://dawk-ps2.vercel.app) — hot-swappable subject matter expert plugins for AI agents.

## Install

```bash
npm install lexic-sdk
```

## Quick Start

```typescript
import { Lexic } from "lexic-sdk";

const lexic = new Lexic({
  apiKey: "lx_xxxxx",
});

const result = await lexic.query({
  plugin: "structural-engineering-v1",
  query: "What is the minimum cover for an RCC column exposed to severe weather?",
});

console.log(result.answer);       // Cited expert answer
console.log(result.citations);    // Source references with excerpts
console.log(result.decisionPath); // Decision tree reasoning trace
console.log(result.confidence);   // "high" | "medium" | "low"
```

## Hot-Swap Plugins

Switch domain experts at runtime — no restart, no redeploy:

```typescript
const lexic = new Lexic({ apiKey: "lx_xxxxx" });

// Ask a structural engineering question
const a = await lexic.query({
  plugin: "structural-engineering-v1",
  query: "Beam depth check for M30 grade concrete?",
});

// Swap to HVAC — same client, same API key
lexic.setActivePlugin("hvac-design-v1");
const b = await lexic.query({ query: "Duct sizing for 500 CFM?" });
```

## Conversation Context & Query Options

Pass conversation history and per-request options:

```typescript
const result = await lexic.query({
  plugin: "structural-engineering-v1",
  query: "What about for a column instead?",
  context: [
    { role: "user", content: "What is the minimum cover for a beam?" },
    { role: "assistant", content: "According to IS 456, the minimum cover for a beam..." },
  ],
  options: {
    citationMode: "inline",       // "inline" | "footnote" | "off"
    maxSources: 5,                // max knowledge base chunks to retrieve
    includeDecisionPath: true,    // include decision tree reasoning trace
  },
});
```

## Streaming

Stream responses token-by-token with pipeline status updates:

```typescript
for await (const event of lexic.queryStream({ plugin: "my-plugin", query: "..." })) {
  switch (event.type) {
    case "status":
      console.log(`[${event.status}] ${event.message}`);
      break;
    case "delta":
      process.stdout.write(event.text);
      break;
    case "done":
      console.log("\n\nCitations:", event.citations);
      console.log("Confidence:", event.confidence);
      break;
    case "error":
      console.error("Error:", event.error);
      break;
  }
}
```

Or use `queryStreamToResult()` to get streaming progress events while still resolving to a single result:

```typescript
const result = await lexic.queryStreamToResult(
  { plugin: "my-plugin", query: "..." },
  (event) => {
    if (event.type === "status") console.log(event.message);
    if (event.type === "delta") process.stdout.write(event.text);
  },
);

console.log(result.answer);    // full cleaned answer
console.log(result.citations); // resolved citations
```

## LangChain Integration

```typescript
import { LexicTool } from "lexic-sdk/langchain";

const tool = new LexicTool({
  apiKey: "lx_xxxxx",
  plugin: "structural-engineering-v1",
  name: "structural_expert",
  description: "Consult a structural engineering expert with cited sources",
  queryOptions: { citationMode: "inline", maxSources: 5 },
});

// Add to any LangChain agent
const agent = createOpenAIToolsAgent({
  llm,
  tools: [tool, ...otherTools],
  prompt,
});

// Hot-swap the plugin mid-conversation
tool.setPlugin("hvac-design-v1");
```

The tool returns a JSON string containing `answer`, `confidence`, `citations` (with full metadata: id, document, page, section, excerpt), and `decisionPath`.

## AutoGPT Integration

```typescript
import { LexicAutoGPT } from "lexic-sdk/autogpt";

const adapter = new LexicAutoGPT({
  apiKey: "lx_xxxxx",
  plugin: "structural-engineering-v1",
  queryOptions: { citationMode: "inline" },
});

// Register as an AutoGPT command
const command = adapter.asCommand();
// command.name     → "consult_structural_engineering_v1"
// command.execute  → async (args) => human-readable string

// Or execute directly
const output = await adapter.execute("What is the minimum cover for a beam?");
```

AutoGPT output is human-readable text:

```
Expert Answer (confidence: high):
The minimum cover is 45mm [Source 1].

Citations:
  [1] IS 456.pdf, p.47 — Table 16

Decision Path:
  Step 1: Exposure? → severe
  Step 2: Cover lookup (45mm)
```

## Configuration

```typescript
const lexic = new Lexic({
  apiKey: "lx_xxxxx",            // Required — your Lexic API key
  baseUrl: "https://...",         // Optional — custom API endpoint
  defaultPlugin: "my-plugin-v1", // Optional — default plugin for queries
  timeout: 30000,                // Optional — request timeout in ms (default: 120s)
});
```

## Response Shape

```typescript
interface QueryResult {
  answer: string;                            // Expert answer with inline [Source N] citations
  citations: Citation[];                     // Resolved source references
  decisionPath: DecisionStep[];              // Decision tree reasoning trace
  confidence: "high" | "medium" | "low";     // Source-backed confidence level
  pluginVersion: string;                     // Plugin version that generated the response
}

interface Citation {
  id: string;          // e.g. "src_1"
  document: string;    // source document name
  page?: number;       // page number (if applicable)
  section?: string;    // section/clause reference
  excerpt: string;     // relevant text excerpt from the source
}

interface DecisionStep {
  step: number;        // 1-indexed step number
  node: string;        // decision tree node ID
  label: string;       // human-readable step description
  value?: string;      // extracted/inferred value at this step
  result?: string;     // terminal action recommendation
}
```

## Stream Events

```typescript
type StreamEvent =
  | { type: "status"; status: string; message: string; sourceCount?: number }
  | { type: "delta"; text: string }
  | { type: "done"; answer: string; citations: Citation[]; decisionPath: DecisionStep[]; confidence: string; pluginVersion: string }
  | { type: "error"; error: string };
```

## Error Handling

All API errors are thrown as `LexicAPIError` with a `status` code:

```typescript
import { LexicAPIError } from "lexic-sdk";

try {
  const result = await lexic.query({ plugin: "my-plugin", query: "..." });
} catch (err) {
  if (err instanceof LexicAPIError) {
    console.error(`API error (${err.status}): ${err.message}`);
  }
}
```

## Links

- [GitHub](https://github.com/retrogtx/dawk-ps2/tree/main/packages/sdk)
- [Lexic Platform](https://dawk-ps2.vercel.app)

## License

MIT
