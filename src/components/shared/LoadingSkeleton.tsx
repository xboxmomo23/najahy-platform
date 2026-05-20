import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface LoadingSkeletonListProps {
  count?: number;
  className?: string;
}

function LoadingSkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-sand bg-paper p-4 sm:p-5",
        className,
      )}
      aria-hidden
    >
      <Skeleton className="h-3 w-24 bg-sand" />
      <Skeleton className="h-9 w-32 bg-sand" />
      <Skeleton className="h-4 w-20 bg-sand" />
    </div>
  );
}

function LoadingSkeletonList({
  count = 5,
  className,
}: LoadingSkeletonListProps) {
  return (
    <ul className={cn("flex flex-col gap-3", className)} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-xl border border-sand bg-paper p-3 sm:p-4"
        >
          <Skeleton className="size-10 shrink-0 rounded-full bg-sand" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/5 max-w-48 bg-sand" />
            <Skeleton className="h-3 w-2/5 max-w-32 bg-sand" />
          </div>
          <Skeleton className="hidden h-8 w-16 shrink-0 rounded-lg bg-sand sm:block" />
        </li>
      ))}
    </ul>
  );
}

function LoadingSkeletonDashboard({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      aria-busy
      aria-label="Chargement du tableau de bord"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20 bg-sand" />
          <Skeleton className="h-8 w-56 max-w-full bg-sand" />
          <Skeleton className="h-4 w-72 max-w-full bg-sand" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg bg-sand sm:w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LoadingSkeletonCard />
        <LoadingSkeletonCard />
        <LoadingSkeletonCard />
        <LoadingSkeletonCard />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl bg-sand lg:col-span-2" />
        <LoadingSkeletonList count={4} />
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return null;
}

LoadingSkeleton.Card = LoadingSkeletonCard;
LoadingSkeleton.List = LoadingSkeletonList;
LoadingSkeleton.Dashboard = LoadingSkeletonDashboard;
