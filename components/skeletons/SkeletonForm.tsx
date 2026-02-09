import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react";

interface SkeletonFormProps {
  fields?: number;
  hasTitle?: boolean;
}

export const SkeletonForm = ({
  fields = 5,
  hasTitle = true,
}: SkeletonFormProps) => {
  return (
    <Card className="w-full">
      {hasTitle && (
        <CardHeader>
          <Skeleton className="h-6 w-1/3 rounded-lg" />
        </CardHeader>
      )}

      <CardBody className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-1/4 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </CardBody>
    </Card>
  );
};