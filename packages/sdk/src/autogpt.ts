/**
 * AutoGPT adapter for Lexic.
 *
 * Usage:
 *   import { LexicAutoGPT } from "lexic-sdk/autogpt";
 *
 *   const adapter = new LexicAutoGPT({
 *     apiKey: "lx_xxxxx",
 *     plugin: "structural-engineering-v1",
 *   });
 *
 *   // Register as an AutoGPT command
 *   const command = adapter.asCommand();
 */

import { Lexic, LexicAPIError } from "./index";
import type { QueryResult, QueryRequestOptions } from "./types";

export interface LexicAutoGPTConfig {
  apiKey: string;
  plugin: string;
  baseUrl?: string;
  commandName?: string;
  commandDescription?: string;
  /** Default query options applied to every execution. */
  queryOptions?: QueryRequestOptions;
}

export interface AutoGPTCommand {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required: boolean }>;
  execute: (args: Record<string, string>) => Promise<string>;
}

/**
 * Wraps Lexic as an AutoGPT-compatible command.
 * AutoGPT uses a command interface with name, description, parameters, and execute.
 */
export class LexicAutoGPT {
  private client: Lexic;
  private plugin: string;
  private commandName: string;
  private commandDescription: string;
  private queryOptions?: QueryRequestOptions;

  constructor(config: LexicAutoGPTConfig) {
    this.client = new Lexic({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    });
    this.plugin = config.plugin;
    this.queryOptions = config.queryOptions;
    this.commandName =
      config.commandName || `consult_${config.plugin.replace(/-/g, "_")}`;
    this.commandDescription =
      config.commandDescription ||
      `Consult the "${config.plugin}" subject matter expert. Returns a cited, decision-tree-backed answer.`;
  }

  /** Convert to AutoGPT command format. */
  asCommand(): AutoGPTCommand {
    return {
      name: this.commandName,
      description: this.commandDescription,
      parameters: {
        query: {
          type: "string",
          description: "The domain-specific question to ask the expert",
          required: true,
        },
      },
      execute: async (args: Record<string, string>): Promise<string> => {
        return this.execute(args.query);
      },
    };
  }

  /** Execute a query directly. Returns human-readable formatted text. */
  async execute(query: string): Promise<string> {
    try {
      const result: QueryResult = await this.client.query({
        plugin: this.plugin,
        query,
        options: this.queryOptions,
      });

      return formatResultForAutoGPT(result);
    } catch (err) {
      if (err instanceof LexicAPIError) {
        return `Lexic Error (${err.status}): ${err.message}`;
      }
      return `Lexic Error: ${(err as Error).message}`;
    }
  }

  /** Switch which plugin this adapter queries (hot-swap). */
  setPlugin(pluginSlug: string): void {
    this.plugin = pluginSlug;
  }
}

/**
 * Format a QueryResult into human-readable text for AutoGPT consumption.
 * Gracefully handles missing/empty fields.
 */
function formatResultForAutoGPT(result: QueryResult): string {
  const lines: string[] = [
    `Expert Answer (confidence: ${result.confidence}):`,
    result.answer,
  ];

  const citations = result.citations ?? [];
  if (citations.length > 0) {
    lines.push("", "Citations:");
    for (let i = 0; i < citations.length; i++) {
      const c = citations[i];
      let ref = `  [${i + 1}] ${c.document}`;
      if (c.page != null) ref += `, p.${c.page}`;
      if (c.section) ref += ` — ${c.section}`;
      lines.push(ref);
    }
  }

  const decisionPath = result.decisionPath ?? [];
  if (decisionPath.length > 0) {
    lines.push("", "Decision Path:");
    for (const step of decisionPath) {
      let entry = `  Step ${step.step}: ${step.label}`;
      if (step.value) entry += ` → ${step.value}`;
      if (step.result) entry += ` (${step.result})`;
      lines.push(entry);
    }
  }

  return lines.join("\n");
}
