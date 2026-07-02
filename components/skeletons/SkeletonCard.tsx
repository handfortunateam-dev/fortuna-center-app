import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Skeleton,
} from "@heroui/react";

interface SkeletonCardProps {
  hasHeader?: boolean;
  hasFooter?: boolean;
  rows?: number;
  variant?: "default" | "detail" | "edit" | "create";
}

export const SkeletonCard = ({
  hasHeader = true,
  hasFooter = false,
  rows = 3,
  variant = "default",
}: SkeletonCardProps) => {
  // Detail page skeleton - matches CardWrapper with TextShow grid layout
  if (variant === "detail") {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-col items-start gap-3 px-6 py-4">
          <Skeleton className="h-8 w-2/5 rounded-lg" />
          <Skeleton className="h-4 w-3/5 rounded-lg" />
        </CardHeader>

        <CardBody className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Name & Code */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-lg" />
            </div>

            {/* Status & Created At */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24 rounded-lg" />
              <Skeleton className="h-5 w-40 rounded-lg" />
            </div>

            {/* Description - full width */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <Skeleton className="h-3 w-28 rounded-lg" />
              <Skeleton className="h-5 w-full rounded-lg" />
            </div>

            {/* Created By & Last Updated */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-28 rounded-lg" />
              <Skeleton className="h-5 w-40 rounded-lg" />
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Edit/Create page skeleton - matches form layout
  if (variant === "edit" || variant === "create") {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-col items-start gap-3 px-6 py-4">
          <Skeleton className="h-8 w-2/5 rounded-lg" />
          <Skeleton className="h-4 w-3/5 rounded-lg" />
        </CardHeader>

        <CardBody className="px-6 py-6 space-y-6">
          {/* Two column grid for inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4 rounded-lg" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4 rounded-lg" />
            </div>
          </div>

          {/* Textarea */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-3 w-2/3 rounded-lg" />
          </div>

          {/* Switch */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-12 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-3 w-3/4 rounded-lg" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  // Default skeleton (original)
  return (
    <Card className="w-full">
      {hasHeader && (
        <CardHeader className="flex gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3 w-3/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </CardHeader>
      )}

      <CardBody className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-full rounded-lg" />
        ))}
      </CardBody>

      {hasFooter && (
        <CardFooter className="gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </CardFooter>
      )}
    </Card>
  );
};
