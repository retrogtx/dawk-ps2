"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, GitBranch, Loader2 } from "lucide-react";

interface Tree {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

const EXAMPLE_TREE = JSON.stringify(
  {
    rootNodeId: "q1",
    nodes: {
      q1: {
        id: "q1",
        type: "question",
        label: "What type of structural member?",
        question: {
          text: "What type of structural member?",
          options: ["beam", "column", "slab"],
          extractFrom: "member_type",
        },
        childrenByAnswer: {
          beam: "c1",
          column: "c2",
          slab: "a1",
        },
      },
      c1: {
        id: "c1",
        type: "condition",
        label: "Is exposure severe?",
        condition: {
          field: "exposure",
          operator: "eq",
          value: "severe",
        },
        trueChildId: "a2",
        falseChildId: "a3",
      },
      c2: {
        id: "c2",
        type: "action",
        label: "Column recommendation",
        action: {
          recommendation: "Use IS 456 Table 16 for column cover requirements",
          sourceHint: "IS 456 Table 16 nominal cover",
          severity: "info",
        },
      },
      a1: {
        id: "a1",
        type: "action",
        label: "Slab recommendation",
        action: {
          recommendation: "For slabs, refer to IS 456 Clause 26.4.2",
          sourceHint: "IS 456 Clause 26.4.2",
          severity: "info",
        },
      },
      a2: {
        id: "a2",
        type: "action",
        label: "Severe exposure beam",
        action: {
          recommendation: "45mm nominal cover required for beams in severe exposure",
          sourceHint: "IS 456 Table 16 severe exposure beam",
          severity: "warning",
        },
      },
      a3: {
        id: "a3",
        type: "action",
        label: "Mild exposure beam",
        action: {
          recommendation: "20mm nominal cover for beams in mild exposure",
          sourceHint: "IS 456 Table 16 mild exposure beam",
          severity: "info",
        },
      },
    },
  },
  null,
  2,
);

export default function DecisionTreesPage() {
  const params = useParams();
  const pluginId = params.id as string;
  const [trees, setTrees] = useState<Tree[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTrees = useCallback(async () => {
    const res = await fetch(`/api/plugins/${pluginId}/trees`);
    if (res.ok) setTrees(await res.json());
  }, [pluginId]);

  useEffect(() => {
    loadTrees();
  }, [loadTrees]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const treeJson = formData.get("treeData") as string;

    try {
      const treeData = JSON.parse(treeJson);

      const res = await fetch(`/api/plugins/${pluginId}/trees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, treeData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      await loadTrees();
      setCreating(false);
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "Invalid JSON"
          : err instanceof Error
            ? err.message
            : "Failed to create tree",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href={`/plugins/${pluginId}`}
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to plugin
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Decision Trees</h1>
          <p className="text-muted-foreground">
            Define structured reasoning flows for domain-specific logic
          </p>
        </div>
        <Button onClick={() => setCreating(!creating)}>
          <Plus className="mr-2 h-4 w-4" />
          New Tree
        </Button>
      </div>

      {creating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Decision Tree</CardTitle>
            <CardDescription>
              Define the tree as JSON. Each node can be a condition, question, or
              action.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tree Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Beam Cover Check"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Determines required cover based on member type and exposure"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treeData">Tree JSON</Label>
                <Textarea
                  id="treeData"
                  name="treeData"
                  defaultValue={EXAMPLE_TREE}
                  rows={20}
                  className="font-mono text-xs"
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Tree"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {trees.length === 0 && !creating ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12">
            <GitBranch className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="mb-4 text-sm text-muted-foreground">
              No decision trees yet. Trees add structured reasoning to your
              plugin.
            </p>
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Tree
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trees.map((tree) => (
            <Card key={tree.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{tree.name}</p>
                    {tree.description && (
                      <p className="text-sm text-muted-foreground">
                        {tree.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={tree.isActive ? "default" : "secondary"}>
                  {tree.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
