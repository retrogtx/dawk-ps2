"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPluginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      domain: formData.get("domain") as string,
      description: formData.get("description") as string,
      systemPrompt: formData.get("systemPrompt") as string,
      citationMode: formData.get("citationMode") as string,
    };

    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create plugin");
      }

      const plugin = await res.json();
      router.push(`/plugins/${plugin.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/plugins"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to plugins
        </Link>
        <h1 className="text-2xl font-bold">Create New Plugin</h1>
        <p className="text-muted-foreground">
          Define your expert persona and domain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plugin Details</CardTitle>
          <CardDescription>
            This defines who your AI expert is and what domain they cover.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Plugin Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Structural Engineering - IS 456"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                name="domain"
                placeholder="e.g., structural-engineering"
                required
              />
              <p className="text-xs text-muted-foreground">
                A short category identifier for your plugin
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What does this plugin do? What domain does it cover?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Expert System Prompt</Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                placeholder="You are an expert structural engineer specializing in Indian building codes (IS 456:2000). You provide precise, cited answers about concrete design, reinforcement, and structural safety..."
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                This defines the expert persona. Be specific about the domain,
                standards, and expertise level.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="citationMode">Citation Mode</Label>
              <Select name="citationMode" defaultValue="mandatory">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandatory">Mandatory — every claim must cite a source</SelectItem>
                  <SelectItem value="optional">Optional — citations encouraged but not required</SelectItem>
                  <SelectItem value="off">Off — no citations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Plugin"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/plugins">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
