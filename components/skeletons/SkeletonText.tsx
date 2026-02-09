import { Skeleton } from "@heroui/react";

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-3 rounded-lg ${
            index === lines - 1 ? "w-4/5" : "w-full"
          }`}
        />
      ))}
    </div>
  );
};