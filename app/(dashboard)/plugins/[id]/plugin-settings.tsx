"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Copy, Eye, EyeOff, ChevronDown, Key } from "lucide-react";

interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
}

export function PluginSettings({
  pluginId,
  initialName,
  initialDescription,
  initialDomain,
  initialSystemPrompt,
  initialCitationMode,
  slug,
  isPublished,
}: {
  pluginId: string;
  initialName: string;
  initialDescription: string;
  initialDomain: string;
  initialSystemPrompt: string;
  initialCitationMode: string;
  slug: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [domain, setDomain] = useState(initialDomain);
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [citationMode, setCitationMode] = useState(initialCitationMode);

  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [keyDropdownOpen, setKeyDropdownOpen] = useState(false);

  const loadKeys = useCallback(async () => {
    const res = await fetch("/api/api-keys");
    if (res.ok) {
      const keys: ApiKeyInfo[] = await res.json();
      setApiKeys(keys);
      if (keys.length > 0 && !selectedKeyId) {
        setSelectedKeyId(keys[0].id);
      }
    }
  }, [selectedKeyId]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const selectedKey = apiKeys.find((k) => k.id === selectedKeyId);

  const hasChanges =
    name !== initialName ||
    description !== initialDescription ||
    domain !== initialDomain ||
    systemPrompt !== initialSystemPrompt ||
    citationMode !== initialCitationMode;

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`/api/plugins/${pluginId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, domain, systemPrompt, citationMode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const keyDisplay = selectedKey
    ? keyRevealed
      ? `${selectedKey.keyPrefix}${"•".repeat(52)}`
      : `${selectedKey.keyPrefix.slice(0, 6)}${"•".repeat(20)}`
    : "lx_your_key_here";

  const snippetKey = selectedKey
    ? `${selectedKey.keyPrefix}...`
    : "lx_your_key_here";

  const apiSnippet = `curl -X POST /api/v1/query \\
  -H "Authorization: Bearer ${snippetKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "plugin": "${slug}",
    "query": "Your question here"
  }'`;

  function copySnippet() {
    navigator.clipboard.writeText(apiSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyKeyPrefix() {
    if (selectedKey) {
      navigator.clipboard.writeText(selectedKey.keyPrefix + "...");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Plugin Settings */}
      <div className="rounded-md border border-[#262626] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#262626] px-6 py-4">
          <h2 className="font-bold text-white">Plugin Settings</h2>
          <div className="flex items-center gap-2">
            {error && <p className="text-sm text-[#ff4444]">{error}</p>}
            {saved && <p className="text-sm text-[#00d4aa]">Saved</p>}
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-white text-black hover:bg-[#ccc] font-semibold disabled:opacity-40"
              size="sm"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[#a1a1a1]">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#262626] bg-[#111111] text-white focus:border-[#444] focus:ring-0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#a1a1a1]">Domain</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="border-[#262626] bg-[#111111] text-white focus:border-[#444] focus:ring-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#a1a1a1]">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="border-[#262626] bg-[#111111] text-white placeholder:text-[#555] focus:border-[#444] focus:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#a1a1a1]">Citation Mode</Label>
            <Select value={citationMode} onValueChange={setCitationMode}>
              <SelectTrigger className="border-[#262626] bg-[#111111] text-white focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#262626] bg-[#111111]">
                <SelectItem value="mandatory">Mandatory — every claim must cite a source</SelectItem>
                <SelectItem value="optional">Optional — citations encouraged but not required</SelectItem>
                <SelectItem value="off">Off — no citations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#a1a1a1]">System Prompt</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={8}
              className="border-[#262626] bg-[#111111] text-white text-sm placeholder:text-[#555] focus:border-[#444] focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* API Usage */}
      <div className="rounded-md border border-[#262626] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#262626] px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-white">API Usage</h2>
            {isPublished ? (
              <Badge className="bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20">Live</Badge>
            ) : (
              <Badge className="bg-[#1a1a1a] text-[#666] border-[#262626]">Publish to enable</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copySnippet}
            className="border-[#333] text-[#a1a1a1] hover:bg-[#1a1a1a] hover:text-white"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3 w-3 text-[#00d4aa]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* API Key Selector */}
          <div className="space-y-2">
            <Label className="text-[#a1a1a1]">API Key</Label>
            <div className="flex items-center gap-2">
              {/* Key dropdown */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setKeyDropdownOpen(!keyDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-md border border-[#262626] bg-[#111111] px-3 py-2 text-sm text-white transition-colors hover:border-[#444]"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key className="h-3.5 w-3.5 shrink-0 text-[#666]" />
                    {selectedKey ? (
                      <span className="truncate">
                        <span className="text-[#a1a1a1]">{selectedKey.name}</span>
                        <span className="ml-2 text-[#555]">{selectedKey.keyPrefix}...</span>
                      </span>
                    ) : (
                      <span className="text-[#555]">
                        {apiKeys.length === 0 ? "No API keys — create one in API Keys" : "Select a key"}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`ml-2 h-3.5 w-3.5 shrink-0 text-[#666] transition-transform ${keyDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {keyDropdownOpen && apiKeys.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-[#262626] bg-[#111111] py-1 shadow-lg">
                    {apiKeys.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => {
                          setSelectedKeyId(k.id);
                          setKeyDropdownOpen(false);
                          setKeyRevealed(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[#1a1a1a] ${
                          k.id === selectedKeyId ? "text-white bg-[#1a1a1a]" : "text-[#a1a1a1]"
                        }`}
                      >
                        <Key className="h-3.5 w-3.5 shrink-0 text-[#666]" />
                        <span className="truncate">{k.name}</span>
                        <span className="ml-auto shrink-0 text-xs text-[#555]">{k.keyPrefix}...</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reveal toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setKeyRevealed(!keyRevealed)}
                disabled={!selectedKey}
                className="border-[#262626] text-[#a1a1a1] hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30 h-[38px] w-[38px] p-0"
              >
                {keyRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>

              {/* Copy key */}
              <Button
                variant="outline"
                size="sm"
                onClick={copyKeyPrefix}
                disabled={!selectedKey}
                className="border-[#262626] text-[#a1a1a1] hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30 h-[38px] w-[38px] p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Revealed key display */}
            {selectedKey && keyRevealed && (
              <div className="rounded-md border border-[#262626] bg-[#111111] px-3 py-2">
                <code className="text-sm text-[#ededed] break-all">{keyDisplay}</code>
              </div>
            )}
          </div>

          {/* Curl snippet */}
          <pre className="overflow-x-auto rounded-md border border-[#262626] bg-[#111111] p-4 text-sm text-[#ededed]">
            {apiSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
