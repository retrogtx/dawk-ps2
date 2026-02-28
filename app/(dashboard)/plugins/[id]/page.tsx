import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { plugins, knowledgeDocuments, decisionTrees, queryLogs } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, GitBranch, MessageSquare, Globe } from "lucide-react";
import { PublishButton } from "./publish-button";

export default async function PluginDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const plugin = await db.query.plugins.findFirst({
    where: and(eq(plugins.id, id), eq(plugins.creatorId, user.id)),
  });

  if (!plugin) notFound();

  const [docCount] = await db
    .select({ count: count() })
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.pluginId, id));

  const [treeCount] = await db
    .select({ count: count() })
    .from(decisionTrees)
    .where(eq(decisionTrees.pluginId, id));

  const [queryCount] = await db
    .select({ count: count() })
    .from(queryLogs)
    .where(eq(queryLogs.pluginId, id));

  return (
    <div>
      <Link
        href="/plugins"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to plugins
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{plugin.name}</h1>
            <Badge variant={plugin.isPublished ? "default" : "secondary"}>
              {plugin.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {plugin.slug}
          </p>
          {plugin.description && (
            <p className="mt-2 text-muted-foreground">{plugin.description}</p>
          )}
        </div>
        <PublishButton pluginId={plugin.id} isPublished={plugin.isPublished} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={`/plugins/${id}/knowledge`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <Upload className="h-8 w-8 text-blue-500" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Knowledge Base</CardTitle>
              <CardDescription>
                {docCount.count} document{docCount.count !== 1 ? "s" : ""} uploaded
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/plugins/${id}/trees`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <GitBranch className="h-8 w-8 text-green-500" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Decision Trees</CardTitle>
              <CardDescription>
                {treeCount.count} tree{treeCount.count !== 1 ? "s" : ""}
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/plugins/${id}/sandbox`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Test Sandbox</CardTitle>
              <CardDescription>Chat with your plugin</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <Globe className="h-8 w-8 text-orange-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base">Queries</CardTitle>
            <CardDescription>
              {queryCount.count} total quer{queryCount.count !== 1 ? "ies" : "y"}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Plugin Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Domain</p>
            <p className="text-sm text-muted-foreground">{plugin.domain}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Citation Mode</p>
            <Badge variant="outline">{plugin.citationMode}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium">Version</p>
            <p className="text-sm text-muted-foreground">{plugin.version}</p>
          </div>
          <div>
            <p className="text-sm font-medium">System Prompt</p>
            <pre className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
              {plugin.systemPrompt}
            </pre>
          </div>
          {plugin.isPublished && (
            <div>
              <p className="text-sm font-medium">API Usage</p>
              <pre className="mt-1 rounded-md bg-muted p-3 text-sm">
{`POST /api/v1/query
{
  "plugin": "${plugin.slug}",
  "query": "Your question here..."
}`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
