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
import type { QueryRequestOptions, CollaborationMode, CollaborationStreamEvent } from "./types";
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
    parameters: Record<string, {
        type: string;
        description: string;
        required: boolean;
    }>;
    execute: (args: Record<string, string>) => Promise<string>;
}
/**
 * Wraps Lexic as an AutoGPT-compatible command.
 * AutoGPT uses a command interface with name, description, parameters, and execute.
 */
export declare class LexicAutoGPT {
    private client;
    private plugin;
    private commandName;
    private commandDescription;
    private queryOptions?;
    constructor(config: LexicAutoGPTConfig);
    /** Convert to AutoGPT command format. */
    asCommand(): AutoGPTCommand;
    /** Execute a query directly. Returns human-readable formatted text. */
    execute(query: string): Promise<string>;
    /** Switch which plugin this adapter queries (hot-swap). */
    setPlugin(pluginSlug: string): void;
}
export interface LexicCollaborationAutoGPTConfig {
    apiKey: string;
    experts: string[];
    baseUrl?: string;
    commandName?: string;
    commandDescription?: string;
    mode?: CollaborationMode;
    maxRounds?: number;
    onEvent?: (event: CollaborationStreamEvent) => void;
}
/**
 * Wraps Lexic multi-expert collaboration as an AutoGPT command.
 * Runs adversarial deliberation and returns the consensus in
 * human-readable text with per-expert breakdowns.
 */
export declare class LexicCollaborationAutoGPT {
    private client;
    private experts;
    private mode;
    private maxRounds;
    private commandName;
    private commandDescription;
    private onEvent?;
    constructor(config: LexicCollaborationAutoGPTConfig);
    asCommand(): AutoGPTCommand;
    execute(query: string): Promise<string>;
    setExperts(expertSlugs: string[]): void;
    setMode(mode: CollaborationMode): void;
}
//# sourceMappingURL=autogpt.d.ts.map