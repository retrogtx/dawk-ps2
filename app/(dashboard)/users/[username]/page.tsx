import Link from "next/link";
import { notFound } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Blocks, ExternalLink, Search, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { plugins, users } from "@/lib/db/schema";

type MetadataRecord = Record<string, unknown>;

function isMarketplaceShared(config: Record<string, unknown> | null): boolean {
  if (!config) return false;
  return config.marketplaceShared === true;
}

function getMetadata(value: unknown): MetadataRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as MetadataRecord;
}

type PublicPluginCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  domain: string;
  isPublished: boolean;
  config: Record<string, unknown> | null;
};

export default async function PublicUserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const normalizedUsername = username.trim();
  if (!normalizedUsername) notFound();
  const normalizedQuery = normalizedUsername.toLowerCase();

  const client = await clerkClient();
  const exactUsernameMatch = await client.users.getUserList({
    username: [normalizedUsername],
    limit: 1,
  });
  let clerkUser: (typeof exactUsernameMatch.data)[number] | null =
    exactUsernameMatch.data[0] ?? null;

  if (!clerkUser) {
    const fallbackUsers = await client.users.getUserList({ limit: 100 });
    clerkUser =
      fallbackUsers.data.find((candidate) => {
        const metadata = getMetadata(candidate.unsafeMetadata);
        const metadataUsername =
          typeof metadata.username === "string" ? metadata.username.trim() : "";
        const candidateUsername =
          (typeof candidate.username === "string" && candidate.username.trim().length > 0
            ? candidate.username.trim()
            : metadataUsername) || "";
        return candidateUsername.toLowerCase() === normalizedQuery;
      }) ?? null;
  }

  if (!clerkUser) notFound();

  const appUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  const rawPlugins = appUser
    ? await db
        .select({
          id: plugins.id,
          name: plugins.name,
          slug: plugins.slug,
          description: plugins.description,
          domain: plugins.domain,
          isPublished: plugins.isPublished,
          config: plugins.config,
        })
        .from(plugins)
        .where(eq(plugins.creatorId, appUser.id))
        .orderBy(desc(plugins.updatedAt))
    : [];

  const publicPlugins: PublicPluginCard[] = rawPlugins.filter((plugin) =>
    isMarketplaceShared(plugin.config ?? null),
  );

  const metadata = getMetadata(clerkUser.unsafeMetadata);
  const metadataUsername =
    typeof metadata.username === "string" && metadata.username.trim().length > 0
      ? metadata.username.trim()
      : null;
  const canonicalUsername =
    (typeof clerkUser.username === "string" && clerkUser.username.trim().length > 0
      ? clerkUser.username.trim()
      : metadataUsername) || normalizedUsername;
  const nameFromMetadata =
    typeof metadata.name === "string" && metadata.name.trim().length > 0
      ? metadata.name.trim()
      : null;
  const fallbackName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    normalizedUsername;
  const displayName = nameFromMetadata || fallbackName;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/marketplace"
          className="mb-6 inline-flex items-center text-sm text-[#666] transition-colors hover:text-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="mb-8 rounded-md border border-[#262626] bg-[#0a0a0a] p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#262626] bg-[#111111] px-3 py-1.5 text-xs text-[#a1a1a1]">
            <Store className="h-3.5 w-3.5 text-[#00d4aa]" />
            Creator Profile
          </div>
          <h1 className="text-3xl font-bold text-white">{displayName}</h1>
          <p className="mt-1 text-[#a1a1a1]">@{canonicalUsername}</p>
          <p className="mt-4 text-sm text-[#888]">
            Public plugins shared by this creator.
          </p>
        </div>

        {publicPlugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[#333] py-24">
            <Search className="mb-4 h-10 w-10 text-[#555]" />
            <h2 className="mb-2 text-lg font-semibold text-white">No public plugins</h2>
            <p className="text-center text-sm text-[#a1a1a1]">
              This user has not shared any plugins publicly yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicPlugins.map((plugin) => (
              <Link
                key={plugin.id}
                href={`/marketplace/${plugin.slug}`}
                className="group rounded-md border border-[#262626] bg-[#0a0a0a] p-5 transition-all hover:border-[#333] hover:bg-[#111111]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="max-w-[70%] shrink truncate border-[#333] text-[#a1a1a1]">
                    {plugin.domain}
                  </Badge>
                  {plugin.isPublished ? (
                    <Badge className="shrink-0 border-[#00d4aa]/20 bg-[#00d4aa]/10 text-[#00d4aa]">
                      Published
                    </Badge>
                  ) : (
                    <Badge className="shrink-0 border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#f59e0b]">
                      Draft Share
                    </Badge>
                  )}
                </div>
                <h2 className="font-bold text-white">{plugin.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-[#a1a1a1]">
                  {plugin.description || "No description"}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-[#666]">
                  <span className="inline-flex items-center gap-1 text-[#888]">
                    View Plugin <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center text-[#666]">
          <Blocks className="mr-2 h-4 w-4" />
          <span className="text-sm">Total public plugins: {publicPlugins.length}</span>
        </div>
      </div>
    </main>
  );
}
