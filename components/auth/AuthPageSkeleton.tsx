"use client";

import { Card, CardBody, Skeleton } from "@heroui/react";

export default function AuthPageSkeleton() {
  return (
    <Card className="w-full max-w-[420px] shadow-2xl border border-default-100 bg-content1 rounded-2xl overflow-visible">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center pt-8 pb-2 px-8">
        <div className="mb-6">
          <Skeleton className="w-20 h-20 rounded-2xl" />
        </div>
        <Skeleton className="w-3/4 h-8 rounded-lg mb-2" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>

      <CardBody className="px-8 pb-8 pt-6">
        <div className="flex flex-col gap-4">
          {/* Form Fields Skeletons */}
          <div className="space-y-2">
            <Skeleton className="w-1/4 h-4 rounded-lg" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-1/4 h-4 rounded-lg" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>

          {/* Button Skeleton */}
          <Skeleton className="w-full h-10 rounded-lg mt-2" />
        </div>

        {/* Footer Link Skeleton */}
        <div className="mt-6 flex justify-center">
          <Skeleton className="w-2/3 h-4 rounded-lg" />
        </div>
      </CardBody>

      {/* Footer Branding Skeleton */}
      <div className="bg-default-50/50 py-4 text-center border-t border-default-100 rounded-b-2xl flex justify-center">
        <Skeleton className="w-1/3 h-4 rounded-lg" />
      </div>
    </Card>
  );
}
