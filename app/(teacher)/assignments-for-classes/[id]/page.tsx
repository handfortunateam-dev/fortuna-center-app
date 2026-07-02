"use client";

import { use, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import {
  Card,
  CardBody,
  Divider,
  Button,
  Chip,
  Skeleton,
  Breadcrumbs,
  BreadcrumbItem,
  Tabs,
  Tab,
  Avatar,
  AvatarGroup,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

import { useAssignmentDetail } from "@/services/assignmentsService";
import { IAssignment } from "@/features/lms/assignments-by-teacher/interface";
import { SubmissionsTab } from "@/components/teacher/SubmissionsTab";

interface AssignmentDetailProps {
  id: string;
}

function AssignmentDetail({ id }: AssignmentDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: response, isLoading, isError } = useAssignmentDetail(id);
  const [selectedTab, setSelectedTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab === "submissions" ? "submissions" : "content";
  });

  // Handle tab change
  const handleTabChange = (key: React.Key) => {
    const newTab = key.toString();
    setSelectedTab(newTab);

    // Update URL without page reload
    const url = new URL(window.location.href);
    if (newTab === "submissions") {
      url.searchParams.set("tab", "submissions");
    } else {
      url.searchParams.delete("tab");
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Fetch submissions data for stats
  const { data: submissionsData } = useQuery({
    queryKey: ["assignment-submissions", id],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/teacher/assignments/${id}/submissions`,
      );
      return data.data;
    },
    enabled: !!id,
  });

  // Calculate stats from submissions
  const stats = useMemo(() => {
    if (!submissionsData) {
      return {
        total: 0,
        submitted: 0,
        graded: 0,
        submittedPercent: 0,
        gradedPercent: 0,
      };
    }

    const total = submissionsData.submissions.length;
    const submitted = submissionsData.submissions.filter(
      (s: any) => s.submission && s.submission.status !== "pending",
    ).length;
    const graded = submissionsData.submissions.filter(
      (s: any) => s.submission && s.submission.status === "graded",
    ).length;

    return {
      total,
      submitted,
      graded,
      submittedPercent: total > 0 ? Math.round((submitted / total) * 100) : 0,
      gradedPercent: total > 0 ? Math.round((graded / total) * 100) : 0,
    };
  }, [submissionsData]);

  // Get enrolled students for avatars
  const enrolledStudents = useMemo(() => {
    if (!submissionsData) return [];
    return submissionsData.submissions.map((s: any) => s.student);
  }, [submissionsData]);

  if (isLoading) {
    return <AssignmentDetailSkeleton />;
  }

  if (isError || !response?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-rose-50 rounded-3xl border border-rose-100">
        <Icon
          icon="lucide:alert-circle"
          className="text-rose-500 mb-4"
          width={64}
        />
        <h2 className="text-2xl font-bold text-rose-700">
          Failed to load assignment
        </h2>
        <p className="text-rose-600 mb-6 text-center max-w-sm">
          There was an error fetching the assignment details. Please try again
          later.
        </p>
        <Button
          color="danger"
          variant="flat"
          onPress={() => router.push("/assignments-for-classes")}
        >
          Back to list
        </Button>
      </div>
    );
  }

  const assignment: IAssignment = response.data;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "published":
        return {
          color: "success" as const,
          label: "Active",
          icon: "lucide:check-circle",
        };
      case "draft":
        return {
          color: "warning" as const,
          label: "Draft",
          icon: "lucide:file-edit",
        };
      case "closed":
        return {
          color: "danger" as const,
          label: "Closed",
          icon: "lucide:lock",
        };
      default:
        return {
          color: "default" as const,
          label: status,
          icon: "lucide:help-circle",
        };
    }
  };

  const statusCfg = getStatusConfig(assignment.status);

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumbs */}
      <Breadcrumbs color="primary" variant="light">
        <BreadcrumbItem onPress={() => router.push("/dashboard")}>
          Dashboard
        </BreadcrumbItem>
        <BreadcrumbItem onPress={() => router.push("/assignments-for-classes")}>
          Assignments
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>{assignment.title}</BreadcrumbItem>
      </Breadcrumbs>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b border-default-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Chip
              color={statusCfg.color}
              variant="flat"
              size="sm"
              startContent={<Icon icon={statusCfg.icon} className="mr-1" />}
            >
              {statusCfg.label}
            </Chip>
            <span className="text-sm font-medium text-default-400">
              Assignment ID: {assignment.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-default-900 tracking-tight">
            {assignment.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-default-500 font-medium">
            <div className="flex items-center gap-1.5 bg-default-100 px-3 py-1 rounded-full">
              <Icon icon="lucide:school" width={16} />
              <span>{assignment.className}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-default-100 px-3 py-1 rounded-full">
              <Icon icon="lucide:calendar-days" width={16} />
              <span>
                Due:{" "}
                {assignment.dueDate
                  ? format(new Date(assignment.dueDate), "PPP p")
                  : "Evergreen"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            color="primary"
            variant="solid"
            className="px-6 font-bold"
            onPress={() => router.push(`/assignments-for-classes/${id}/edit`)}
            startContent={<Icon icon="lucide:edit-3" width={20} />}
          >
            Edit Task
          </Button>
          <Button
            variant="flat"
            onPress={() => router.push("/assignments-for-classes")}
            startContent={<Icon icon="lucide:arrow-left" width={20} />}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
        {/* Left Col: Details */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs
            aria-label="Assignment view options"
            variant="underlined"
            color="primary"
            selectedKey={selectedTab}
            onSelectionChange={handleTabChange}
            classNames={{
              tabList: "gap-6 w-full border-b border-default-100",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12 text-lg font-semibold",
            }}
          >
            <Tab
              key="content"
              title={
                <div className="flex items-center space-x-2">
                  <Icon icon="lucide:file-text" />
                  <span>Content</span>
                </div>
              }
            >
              <div className="pt-6 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-default-foreground">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Description
                  </h3>
                  <div className="bg-content1 p-6 rounded-3xl border border-default-200 shadow-sm leading-relaxed text-default-600 text-lg">
                    {assignment.description ||
                      "No description provided for this assignment."}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-default-foreground">
                    <div className="w-1.5 h-6 bg-secondary rounded-full" />
                    Instructions for Students
                  </h3>
                  <div className="bg-primary-50 dark:bg-primary-100/10 p-8 rounded-3xl border border-primary-200 dark:border-primary-200/20 leading-relaxed text-default-700 dark:text-default-300 italic border-l-4 border-l-primary">
                    {assignment.instructions ||
                      "Standard class submission rules apply."}
                  </div>
                </div>

                {assignment.attachments &&
                  assignment.attachments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-default-foreground">
                        <div className="w-1.5 h-6 bg-success rounded-full" />
                        Attached Resources ({assignment.attachments.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {assignment.attachments.map((att, index) => (
                          <Card
                            key={index}
                            isPressable
                            isHoverable
                            className="group border-none shadow-sm hover:shadow-xl transition-all rounded-2xl overflow-hidden"
                            as="a"
                            href={att.url}
                            target="_blank"
                          >
                            <CardBody className="p-4 flex flex-row items-center gap-4">
                              <div className="bg-primary-50 text-primary-600 p-4 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <Icon
                                  icon={getAttachmentIcon(att.type)}
                                  width={24}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-default-foreground truncate">
                                  {att.name}
                                </p>
                                <p className="text-xs text-default-400 uppercase font-extrabold tracking-tighter">
                                  {att.type}
                                </p>
                              </div>
                              <Icon
                                icon="lucide:arrow-up-right"
                                className="text-default-300 group-hover:text-primary-500 transition-colors"
                              />
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </Tab>
            <Tab
              key="submissions"
              title={
                <div className="flex items-center space-x-2">
                  <Icon icon="lucide:users" />
                  <span>Submissions</span>
                </div>
              }
            >
              <SubmissionsTab assignmentId={id} />
            </Tab>
          </Tabs>
        </div>

        {/* Right Col: Performance & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-2">
            <CardBody className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-primary-100 uppercase text-xs font-bold tracking-[0.2em] mb-1">
                  Max Score Available
                </p>
                <p className="text-6xl font-black">{assignment.maxScore}</p>
                <p className="text-primary-200 font-medium">Points</p>
              </div>

              <Divider className="bg-primary-600/50" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-primary-200 text-sm">
                    Target Students
                  </span>
                  <span className="font-bold">{stats.total} Students</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-200 text-sm">Status</span>
                  <Chip
                    size="sm"
                    color={statusCfg.color}
                    className="text-white font-bold"
                  >
                    {statusCfg.label}
                  </Chip>
                </div>
              </div>

              <Button
                className="w-full bg-white text-primary-700 font-bold py-6 rounded-2xl"
                variant="solid"
              >
                Mark All as Graded
              </Button>
            </CardBody>
          </Card>

          <Card className="rounded-3xl border-none shadow-md p-4">
            <CardBody className="space-y-6">
              <h4 className="text-lg font-bold text-default-foreground">
                Participation Overview
              </h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-default-500 uppercase tracking-widest text-[10px]">
                      Submitted ({stats.submitted}/{stats.total})
                    </span>
                    <span className="text-primary">
                      {stats.submittedPercent}%
                    </span>
                  </div>
                  <Progress
                    value={stats.submittedPercent}
                    color="primary"
                    className="h-2"
                    size="sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-default-500 uppercase tracking-widest text-[10px]">
                      Graded ({stats.graded}/{stats.total})
                    </span>
                    <span className="text-success">{stats.gradedPercent}%</span>
                  </div>
                  <Progress
                    value={stats.gradedPercent}
                    color="success"
                    className="h-2"
                    size="sm"
                  />
                </div>
              </div>

              <Divider />

              <div className="space-y-4">
                <h5 className="font-bold text-default-foreground text-sm">
                  Enrolled Students
                </h5>
                {enrolledStudents.length > 0 ? (
                  <AvatarGroup isBordered max={5} total={stats.total}>
                    {enrolledStudents.slice(0, 5).map((student: any) => (
                      <Avatar
                        key={student.id}
                        name={student.name}
                        src={student.image}
                        showFallback
                      />
                    ))}
                  </AvatarGroup>
                ) : (
                  <p className="text-sm text-default-500">
                    No students enrolled
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

const getAttachmentIcon = (type: string) => {
  switch (type) {
    case "image":
      return "lucide:image";
    case "video":
      return "lucide:video";
    case "audio":
      return "lucide:music";
    case "document":
      return "lucide:file-text";
    default:
      return "lucide:paperclip";
  }
};

function AssignmentDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Skeleton className="w-1/3 h-10 rounded-lg" />
      <Skeleton className="w-full h-40 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <Skeleton className="w-full h-80 rounded-3xl" />
        <Skeleton className="w-full h-80 rounded-3xl" />
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AssignmentDetail id={id} />;
}
