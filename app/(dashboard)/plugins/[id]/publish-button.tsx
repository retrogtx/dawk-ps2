"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe, EyeOff } from "lucide-react";

export function PublishButton({
  pluginId,
  isPublished,
}: {
  pluginId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function togglePublish() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/plugins/${pluginId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Failed to ${isPublished ? "unpublish" : "publish"}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={togglePublish}
        disabled={loading}
        variant={isPublished ? "outline" : "default"}
      >
        {isPublished ? (
          <>
            <EyeOff className="mr-2 h-4 w-4" />
            Unpublish
          </>
        ) : (
          <>
            <Globe className="mr-2 h-4 w-4" />
            Publish
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
