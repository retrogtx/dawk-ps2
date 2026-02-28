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

  async function togglePublish() {
    setLoading(true);
    try {
      await fetch(`/api/plugins/${pluginId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
