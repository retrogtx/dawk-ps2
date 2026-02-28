"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    id: string;
    document: string;
    page?: number;
    section?: string;
    excerpt: string;
  }>;
  confidence?: string;
  decisionPath?: Array<{
    step: number;
    label: string;
    value?: string;
    result?: string;
  }>;
}

interface PluginInfo {
  name: string;
  slug: string;
  isPublished: boolean;
}

export default function SandboxPage() {
  const params = useParams();
  const pluginId = params.id as string;
  const [plugin, setPlugin] = useState<PluginInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadPlugin = useCallback(async () => {
    const res = await fetch(`/api/plugins/${pluginId}`);
    if (res.ok) setPlugin(await res.json());
  }, [pluginId]);

  useEffect(() => {
    loadPlugin();
  }, [loadPlugin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !plugin) return;

    const query = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    try {
      const res = await fetch(`/api/sandbox/${pluginId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            citations: data.citations,
            confidence: data.confidence,
            decisionPath: data.decisionPath,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get response" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4">
        <Link
          href={`/plugins/${pluginId}`}
          className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to plugin
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Test Sandbox</h1>
          {plugin && (
            <Badge variant="outline">{plugin.name}</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Chat with your plugin to test responses, citations, and decision tree behavior
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <Bot className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  Ask a question to test your plugin
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>

                    {msg.confidence && (
                      <Badge
                        className="mt-2"
                        variant={
                          msg.confidence === "high"
                            ? "default"
                            : msg.confidence === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        Confidence: {msg.confidence}
                      </Badge>
                    )}

                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 space-y-2 border-t pt-2">
                        <p className="text-xs font-medium opacity-70">Sources:</p>
                        {msg.citations.map((c) => (
                          <div
                            key={c.id}
                            className="rounded bg-background/50 p-2 text-xs"
                          >
                            <span className="font-medium">{c.document}</span>
                            {c.section && (
                              <span className="opacity-70"> — {c.section}</span>
                            )}
                            <p className="mt-1 opacity-60">{c.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.decisionPath && msg.decisionPath.length > 0 && (
                      <div className="mt-3 space-y-1 border-t pt-2">
                        <p className="text-xs font-medium opacity-70">
                          Decision Path:
                        </p>
                        {msg.decisionPath.map((step) => (
                          <div key={step.step} className="text-xs opacity-60">
                            {step.step}. {step.label}
                            {step.value && ` → ${step.value}`}
                            {step.result && ` → ${step.result}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        <div className="border-t p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
