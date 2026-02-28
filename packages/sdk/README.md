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

## LangChain Integration

```typescript
import { LexicTool } from "lexic-sdk/langchain";

const tool = new LexicTool({
  apiKey: "lx_xxxxx",
  plugin: "structural-engineering-v1",
  name: "structural_expert",
  description: "Consult a structural engineering expert with cited sources",
});

// Add to any LangChain agent
const agent = createOpenAIToolsAgent({
  llm,
  tools: [tool, ...otherTools],
  prompt,
});
```

## AutoGPT Integration

```typescript
import { LexicAutoGPT } from "lexic-sdk/autogpt";

const adapter = new LexicAutoGPT({
  apiKey: "lx_xxxxx",
  plugin: "structural-engineering-v1",
});

// Register as an AutoGPT command
const command = adapter.asCommand();
// command.name     → "consult_structural_engineering_v1"
// command.execute  → async (args) => string
```

## Configuration

```typescript
const lexic = new Lexic({
  apiKey: "lx_xxxxx",            // Required — your Lexic API key
  baseUrl: "https://...",         // Optional — custom API endpoint
  defaultPlugin: "my-plugin-v1", // Optional — default plugin for queries
  timeout: 30000,                // Optional — request timeout in ms (default: 30s)
});
```

## Response Shape

```typescript
interface QueryResult {
  answer: string;          // Expert answer with inline [Source N] citations
  citations: Citation[];   // Resolved source references
  decisionPath: Step[];    // Decision tree reasoning trace
  confidence: "high" | "medium" | "low";
  pluginVersion: string;
}
```

## License

MIT
