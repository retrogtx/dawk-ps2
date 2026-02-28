import {
  DashboardCardGridSkeleton,
  DashboardHeaderSkeleton,
  DashboardSearchSkeleton,
} from "@/components/page-skeletons";

export default function Loading() {
  return (
    <div>
      <DashboardHeaderSkeleton />
      <DashboardSearchSkeleton />
      <DashboardCardGridSkeleton cards={4} />
    </div>
  );
}
