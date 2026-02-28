/**
 * AutoGPT adapter for Lexic.
 *
 * Usage:
 *   import { LexicAutoGPT } from "@lexic/sdk/autogpt";
 *
 *   const adapter = new LexicAutoGPT({
 *     apiKey: "lx_xxxxx",
 *     plugin: "structural-engineering-v1",
 *   });
 *
 *   // Register as an AutoGPT command
 *   const command = adapter.asCommand();
 */
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
    constructor(config: LexicAutoGPTConfig);
    /** Convert to AutoGPT command format. */
    asCommand(): AutoGPTCommand;
    /** Execute a query directly. */
    execute(query: string): Promise<string>;
    /** Switch which plugin this adapter queries (hot-swap). */
    setPlugin(pluginSlug: string): void;
}
//# sourceMappingURL=autogpt.d.ts.map