import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { plugins } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Blocks } from "lucide-react";

export default async function PluginsPage() {
  const user = await requireUser();

  const userPlugins = await db
    .select()
    .from(plugins)
    .where(eq(plugins.creatorId, user.id))
    .orderBy(desc(plugins.createdAt));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Plugins</h1>
          <p className="text-muted-foreground">
            Create and manage your SME expert plugins
          </p>
        </div>
        <Button asChild>
          <Link href="/plugins/new">
            <Plus className="mr-2 h-4 w-4" />
            New Plugin
          </Link>
        </Button>
      </div>

      {userPlugins.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Blocks className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No plugins yet</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Create your first SME plugin to turn a generalist AI into a domain expert.
            </p>
            <Button asChild>
              <Link href="/plugins/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Plugin
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {userPlugins.map((plugin) => (
            <Link key={plugin.id} href={`/plugins/${plugin.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {plugin.slug}
                      </CardDescription>
                    </div>
                    <Badge variant={plugin.isPublished ? "default" : "secondary"}>
                      {plugin.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {plugin.description || "No description"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline">{plugin.domain}</Badge>
                    <span className="text-xs text-muted-foreground">v{plugin.version}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
