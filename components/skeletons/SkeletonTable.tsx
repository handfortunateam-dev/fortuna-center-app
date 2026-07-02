import { Skeleton } from "@heroui/react";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable = ({
  rows = 5,
  columns = 4,
}: SkeletonTableProps) => {
  return (
    <div className="w-full space-y-3">
      {/* Table Header Skeleton */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-4 flex-1 rounded-lg" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex gap-4 p-4 border-b border-gray-100"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 flex-1 rounded-lg"
            />
          ))}
        </div>
      ))}
    </div>
  );
};