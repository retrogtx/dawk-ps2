import type {
  LexicConfig,
  QueryOptions,
  QueryResult,
  LexicError,
} from "./types";

export type { LexicConfig, QueryOptions, QueryResult, Citation, DecisionStep, LexicError } from "./types";

const DEFAULT_BASE_URL = "https://dawk-ps2.vercel.app";
const DEFAULT_TIMEOUT = 30_000;

export class Lexic {
  private apiKey: string;
  private baseUrl: string;
  private activePlugin: string | null;
  private timeout: number;

  constructor(config: LexicConfig) {
    if (!config.apiKey) {
      throw new Error("Lexic: apiKey is required");
    }

    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
    this.activePlugin = config.defaultPlugin || null;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Set the active plugin for subsequent queries.
   * Hot-swap: just call this to switch domains mid-conversation.
   */
  setActivePlugin(pluginSlug: string): void {
    this.activePlugin = pluginSlug;
  }

  /** Returns the currently active plugin slug, or null. */
  getActivePlugin(): string | null {
    return this.activePlugin;
  }

  /**
   * Query an expert plugin. Returns a cited, decision-tree-backed answer.
   *
   * @param options.plugin - Plugin slug (overrides activePlugin for this call)
   * @param options.query  - The question to ask the expert
   */
  async query(options: QueryOptions): Promise<QueryResult> {
    const plugin = options.plugin || this.activePlugin;
    if (!plugin) {
      throw new Error(
        "Lexic: no plugin specified. Pass `plugin` in query options or call setActivePlugin() first.",
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ plugin, query: options.query }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as LexicError;
        throw new LexicAPIError(
          body.error || `HTTP ${res.status}`,
          res.status,
        );
      }

      return (await res.json()) as QueryResult;
    } catch (err) {
      if (err instanceof LexicAPIError) throw err;
      if ((err as Error).name === "AbortError") {
        throw new LexicAPIError(`Request timed out after ${this.timeout}ms`, 408);
      }
      throw new LexicAPIError((err as Error).message || "Network error", 0);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export class LexicAPIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "LexicAPIError";
    this.status = status;
  }
}
