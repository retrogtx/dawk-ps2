import {
  DashboardHeaderSkeleton,
  DashboardListSkeleton,
} from "@/components/page-skeletons";

export default function Loading() {
  return (
    <div>
      <DashboardHeaderSkeleton />
      <DashboardListSkeleton rows={6} />
    </div>
  );
}
