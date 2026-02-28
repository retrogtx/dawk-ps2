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
import type { QueryResult } from "./types";

export interface LexicAutoGPTConfig {
  apiKey: string;
  plugin: string;
  baseUrl?: string;
  commandName?: string;
  commandDescription?: string;
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

  constructor(config: LexicAutoGPTConfig) {
    this.client = new Lexic({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    });
    this.plugin = config.plugin;
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

  /** Execute a query directly. */
  async execute(query: string): Promise<string> {
    try {
      const result: QueryResult = await this.client.query({
        plugin: this.plugin,
        query,
      });

      return [
        `Expert Answer (confidence: ${result.confidence}):`,
        result.answer,
        "",
        "Citations:",
        ...result.citations.map(
          (c, i) =>
            `  [${i + 1}] ${c.document}${c.section ? ` — ${c.section}` : ""}`,
        ),
        ...(result.decisionPath.length > 0
          ? [
              "",
              "Decision Path:",
              ...result.decisionPath.map(
                (s) => `  Step ${s.step}: ${s.label}${s.value ? ` → ${s.value}` : ""}`,
              ),
            ]
          : []),
      ].join("\n");
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
