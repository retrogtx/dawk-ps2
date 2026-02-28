import { Skeleton } from "@/components/ui/skeleton";

export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex items-center justify-between rounded-md border border-[#262626] px-4 py-3">
          <Skeleton className="h-6 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="space-y-4 py-10 text-center">
          <Skeleton className="mx-auto h-10 w-3/5" />
          <Skeleton className="mx-auto h-5 w-2/3" />
          <div className="mx-auto mt-6 flex w-fit gap-3">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DocsPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-8">
        <div className="hidden w-64 shrink-0 space-y-2 lg:block">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md rounded-md border border-[#262626] bg-[#0a0a0a] p-6">
        <Skeleton className="mb-4 h-7 w-40" />
        <Skeleton className="mb-2 h-10 w-full" />
        <Skeleton className="mb-2 h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function DashboardHeaderSkeleton({ actionWidth = 120 }: { actionWidth?: number }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10" style={{ width: actionWidth }} />
    </div>
  );
}

export function DashboardSearchSkeleton() {
  return (
    <div className="mb-6 flex gap-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-20" />
    </div>
  );
}

export function DashboardCardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-md border border-[#262626] bg-[#0a0a0a] p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-5 h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function DashboardListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-md border border-[#262626] bg-[#0a0a0a] p-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

export function DashboardFormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton actionWidth={110} />
      <div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-6">
        <div className="space-y-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-36" />
      <DashboardHeaderSkeleton actionWidth={100} />
      <div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-6">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSplitPanelSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-36" />
      <DashboardHeaderSkeleton actionWidth={0} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="mt-3 h-40 w-full" />
          <Skeleton className="mt-4 h-10 w-40" />
        </div>
        <div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-6">
          <Skeleton className="h-6 w-32" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardChatSkeleton() {
  return (
    <div className="space-y-4">
      <DashboardHeaderSkeleton actionWidth={90} />
      <div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-4">
        <Skeleton className="h-12 w-full" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-20 w-4/5" />
          <Skeleton className="ml-auto h-16 w-2/3" />
          <Skeleton className="h-24 w-5/6" />
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}

export function TreeEditorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border border-[#262626] bg-[#0a0a0a] p-3">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-4">
        <Skeleton className="h-[65vh] w-full" />
      </div>
    </div>
  );
}
