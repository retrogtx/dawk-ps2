import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { plugins } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
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
          <h1 className="text-2xl font-bold text-white">My Plugins</h1>
          <p className="text-[#a1a1a1]">
            Create and manage your expert plugins
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#ccc] font-semibold" asChild>
          <Link href="/plugins/new">
            <Plus className="mr-2 h-4 w-4" />
            New Plugin
          </Link>
        </Button>
      </div>

      {userPlugins.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[#333] py-20">
          <Blocks className="mb-4 h-12 w-12 text-[#444]" />
          <h3 className="mb-2 text-lg font-semibold text-white">No plugins yet</h3>
          <p className="mb-6 text-center text-sm text-[#a1a1a1]">
            Create your first plugin to turn a generalist AI into a domain expert.
          </p>
          <Button className="bg-white text-black hover:bg-[#ccc] font-semibold" asChild>
            <Link href="/plugins/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Plugin
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {userPlugins.map((plugin) => (
            <Link key={plugin.id} href={`/plugins/${plugin.id}`}>
              <div className="group rounded-md border border-[#262626] bg-[#0a0a0a] p-5 transition-all hover:border-[#333] hover:bg-[#111111]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">{plugin.name}</h3>
                  </div>
                  <Badge
                    variant={plugin.isPublished ? "default" : "secondary"}
                    className={plugin.isPublished
                      ? "bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20"
                      : "bg-[#1a1a1a] text-[#666] border-[#262626]"
                    }
                  >
                    {plugin.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-[#a1a1a1]">
                  {plugin.description || "No description"}
                </p>
                <div className="mt-3">
                  <Badge variant="outline" className="border-[#333] text-[#888]">{plugin.domain}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
