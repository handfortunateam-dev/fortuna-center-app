"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Input, Skeleton, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { StateMessage } from "@/components/state-message";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAsyncList } from "react-stately";

interface ClassOption {
  id: string;
  name: string;
  code?: string;
  teacherClasses: {
    teacher: {
      name: string;
    };
  }[];
  classSchedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  sessionCount: number;
}

interface PaginationData {
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextPage: number | null;
}

interface ApiResponse {
  success: boolean;
  data: ClassOption[];
  pagination: PaginationData;
}

const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceManagementPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Using useAsyncList for data fetching and state management
  const list = useAsyncList<ClassOption>({
    async load({ cursor, items }) {
      const page = cursor || "1";
      const limit = 8; // User requested limit 8

      const response = await fetch(
        `/api/attendance-management/classes?page=${page}&limit=${limit}&search=${debouncedSearch}`,
      );
      const json: ApiResponse = await response.json();

      if (!json.success) {
        throw new Error("Failed to fetch classes");
      }

      setHasMore(json.pagination.hasMore);

      // Deduplicate items just in case the server returns overlapping data or the hook triggers twice
      const existingIds = new Set(items.map((item) => item.id));
      const newItems = json.data.filter((item) => !existingIds.has(item.id));

      return {
        items: newItems,
        cursor: json.pagination.nextPage?.toString(),
      };
    },
  });

  // Reload the list when debounced search changes
  useEffect(() => {
    // Only reload if the search term has actually changed
    // We exclude 'list' from dependencies to prevent an infinite loop
    // because calling list.reload() updates the list state, which would re-trigger this effect.
    list.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Using useInfiniteScroll for scroll-triggered fetching
  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasMore && !list.isLoading && list.items.length > 0,
    distance: 400,
    onLoadMore: list.loadMore,
  });

  if (list.error) {
    return (
      <StateMessage
        icon="solar:danger-circle-bold-duotone"
        title="Error Loading Classes"
        message={
          list.error instanceof Error ? list.error.message : "Unknown error"
        }
        type="error"
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full overflow-hidden">
      {/* Header section - stays at top */}
      <div className="space-y-6 pb-6 shrink-0">
        <div>
          <Heading className="text-3xl font-bold">
            Attendance Management
          </Heading>
          <Text className="text-default-500 mt-1">
            Monitor student attendance across all classes and sessions
          </Text>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Heading className="text-xl font-semibold">Select a Class</Heading>
          <div className="w-full max-w-xs">
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4" />
              }
              isClearable
              onClear={() => {
                setSearchQuery("");
                setDebouncedSearch("");
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid Content - This is the scrollable area */}
      <div
        ref={scrollerRef as React.RefObject<HTMLDivElement>}
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
      >
        {list.isLoading && list.items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="h-48 shadow-sm">
                <CardBody className="p-4 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {list.items.map((cls) => (
                <Card
                  key={cls.id}
                  isPressable
                  onPress={() =>
                    router.push(`/attendance-management/${cls.id}`)
                  }
                  className="group hover:scale-[1.00] active:scale-[0.98] border-2 border-transparent hover:border-primary transition-all shadow-sm h-full min-h-[220px]"
                >
                  <CardBody className="p-6 flex flex-col items-start gap-4 h-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon
                          icon="solar:book-bookmark-bold-duotone"
                          width={28}
                        />
                      </div>
                      <div className="flex gap-1">
                        {cls.sessionCount > 0 && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="success"
                            className="font-mono text-[10px]"
                            startContent={
                              <Icon
                                icon="solar:calendar-check-bold-duotone"
                                width={12}
                              />
                            }
                          >
                            {cls.sessionCount}{" "}
                            {cls.sessionCount === 1 ? "Session" : "Sessions"}
                          </Chip>
                        )}
                        {cls.classSchedules?.length > 0 && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="font-mono text-[10px]"
                            startContent={
                              <Icon
                                icon="solar:alarm-bold-duotone"
                                width={12}
                              />
                            }
                          >
                            {cls.classSchedules.length}{" "}
                            {cls.classSchedules.length === 1 ? "Slot" : "Slots"}
                          </Chip>
                        )}
                      </div>
                    </div>

                    <div className="w-full">
                      <Text className="font-bold text-xl leading-tight uppercase tracking-tight line-clamp-1">
                        {cls.name}
                      </Text>
                      <Text className="text-xs text-default-400 mt-1 font-medium italic">
                        {cls.code || "N/A"}
                      </Text>
                    </div>

                    {/* Lecturers */}
                    <div className="flex flex-col gap-1 w-full">
                      <Text className="text-[10px] uppercase font-bold text-default-400 tracking-wider">
                        Lecturers
                      </Text>
                      <div className="flex flex-wrap gap-1">
                        {cls.teacherClasses?.length ? (
                          cls.teacherClasses.map(({ teacher }, idx) => (
                            <Chip
                              key={idx}
                              size="sm"
                              variant="flat"
                              color="primary"
                              className="h-5 text-[10px]"
                            >
                              {teacher.name}
                            </Chip>
                          ))
                        ) : (
                          <Text className="text-[10px] text-default-400 italic">
                            No lecturers assigned
                          </Text>
                        )}
                      </div>
                    </div>

                    {/* Next Schedules */}
                    {cls.classSchedules?.length > 0 && (
                      <div className="flex flex-col gap-1 w-full">
                        <Text className="text-[10px] uppercase font-bold text-default-400 tracking-wider">
                          Schedule
                        </Text>
                        <div className="flex flex-wrap gap-1">
                          {cls.classSchedules.slice(0, 2).map((sched, idx) => (
                            <div
                              key={idx}
                              className="bg-default-100 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                            >
                              <span className="text-primary font-bold">
                                {dayNamesShort[sched.dayOfWeek]}
                              </span>
                              <span>{sched.startTime.substring(0, 5)}</span>
                            </div>
                          ))}
                          {cls.classSchedules.length > 2 && (
                            <Text className="text-[10px] text-default-400">
                              +{cls.classSchedules.length - 2} more
                            </Text>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="w-full pt-2 flex justify-end mt-auto">
                      <div className="flex items-center text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        View Sessions
                        <Icon
                          icon="solar:arrow-right-bold-duotone"
                          className="ml-1"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Load more indicator - placed AFTER the grid */}
            {hasMore && (
              <div
                ref={loaderRef as React.RefObject<HTMLDivElement>}
                className="w-full flex justify-center py-8"
              >
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Text className="text-sm text-default-400">
                    Loading more classes...
                  </Text>
                </div>
              </div>
            )}

            {!hasMore && list.items.length > 0 && (
              <div className="w-full text-center py-10 opacity-50">
                <Text className="text-sm italic">
                  You&apos;ve reached the end of the list.
                </Text>
              </div>
            )}
          </>
        )}

        {!list.isLoading && list.items.length === 0 && (
          <div className="text-center py-20 w-full col-span-full">
            <StateMessage
              icon="solar:info-circle-bold-duotone"
              title="No Classes Found"
              message="There are no classes available to track attendance."
              type="empty"
            />
          </div>
        )}
      </div>
    </div>
  );
}
