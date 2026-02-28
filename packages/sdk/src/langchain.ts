/**
 * LangChain adapter for Lexic.
 *
 * Usage:
 *   import { LexicTool } from "lexic-sdk/langchain";
 *
 *   const tool = new LexicTool({
 *     apiKey: "lx_xxxxx",
 *     plugin: "structural-engineering-v1",
 *     name: "structural_expert",
 *     description: "Consult a structural engineering expert",
 *   });
 *
 *   // Add to any LangChain agent's tool list
 *   const agent = createOpenAIToolsAgent({ llm, tools: [tool], prompt });
 */

import { Lexic, LexicAPIError } from "./index";
import type { QueryResult } from "./types";

export interface LexicToolConfig {
  apiKey: string;
  plugin: string;
  baseUrl?: string;
  name?: string;
  description?: string;
}

/**
 * A LangChain-compatible tool that wraps the Lexic query API.
 * Implements the minimal Tool interface so it works with any LangChain agent
 * without requiring langchain as a dependency.
 */
export class LexicTool {
  name: string;
  description: string;

  private client: Lexic;
  private plugin: string;

  constructor(config: LexicToolConfig) {
    this.client = new Lexic({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    });
    this.plugin = config.plugin;
    this.name = config.name || `lexic_${config.plugin.replace(/-/g, "_")}`;
    this.description =
      config.description ||
      `Query the "${config.plugin}" plugin for expert, cited answers on domain-specific questions.`;
  }

  /** LangChain Tool interface — called by the agent with a string input. */
  async call(input: string): Promise<string> {
    return this._call(input);
  }

  /** LangChain StructuredTool._call implementation. */
  async _call(input: string): Promise<string> {
    try {
      const result: QueryResult = await this.client.query({
        plugin: this.plugin,
        query: input,
      });

      return JSON.stringify({
        answer: result.answer,
        citations: result.citations.map((c) => ({
          document: c.document,
          section: c.section,
          excerpt: c.excerpt,
        })),
        confidence: result.confidence,
        decisionPath: result.decisionPath,
      });
    } catch (err) {
      if (err instanceof LexicAPIError) {
        return JSON.stringify({ error: err.message, status: err.status });
      }
      return JSON.stringify({ error: (err as Error).message });
    }
  }

  /** Switch which plugin this tool queries (hot-swap). */
  setPlugin(pluginSlug: string): void {
    this.plugin = pluginSlug;
  }
}
