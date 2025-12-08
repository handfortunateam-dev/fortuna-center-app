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
  }
  
  export const SkeletonCard = ({
    hasHeader = true,
    hasFooter = false,
    rows = 3,
  }: SkeletonCardProps) => {
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