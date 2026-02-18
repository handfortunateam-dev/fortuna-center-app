"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import {
  useAssignments,
  deleteAssignment,
  assignmentKeys,
} from "@/services/assignmentsService";
import { Toast } from "@/components/toast";

export default function AssignmentsForClassesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [assignmentToDelete, setAssignmentToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [submissionCount, setSubmissionCount] = useState<number>(0);

  // Fetch Teacher's Classes
  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    queryKey: ["teacher-classes-simple"],
    queryFn: async () => {
      const res = await apiClient.get<any[]>("/teacher/classes");
      return res.data;
    },
  });

  // Fetch Assignments
  const { data: assignmentsResponse, isLoading: isAssignmentsLoading } =
    useAssignments({
      classId: selectedClassId !== "all" ? selectedClassId : undefined,
    });

  const assignments = useMemo(
    () => assignmentsResponse?.data || [],
    [assignmentsResponse],
  );

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      Toast({
        title: "Success",
        description: "Assignment deleted successfully",
        color: "success",
      });
      onClose();
      setAssignmentToDelete(null);
    },
    onError: (err: any) => {
      Toast({
        title: "Error",
        description: err.message || "Failed to delete assignment",
        color: "danger",
      });
    },
  });

  // Handle delete with submission check
  const handleDeleteClick = async (assignmentId: string, title: string) => {
    try {
      // Fetch submission count
      const { data } = await apiClient.get(
        `/teacher/assignments/${assignmentId}/submissions`,
      );
      const count = data.data.submissions.filter(
        (s: any) => s.submission && s.submission.status !== "pending",
      ).length;

      setSubmissionCount(count);
      setAssignmentToDelete({ id: assignmentId, title });
      onOpen();
    } catch (error) {
      Toast({
        title: "Error",
        description: "Failed to check submissions",
        color: "danger",
      });
    }
  };

  const confirmDelete = () => {
    if (assignmentToDelete) {
      deleteMutation.mutate(assignmentToDelete.id);
    }
  };

  // Filter local search
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [assignments, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = assignments.length;
    const published = assignments.filter(
      (a) => a.status === "published",
    ).length;
    const drafts = assignments.filter((a) => a.status === "draft").length;
    const closed = assignments.filter((a) => a.status === "closed").length;
    return { total, published, drafts, closed };
  }, [assignments]);

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

  if (isClassesLoading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="w-full h-48 rounded-3xl bg-default-100 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 rounded-3xl border-none shadow-md">
              <CardBody className="p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-20 h-6 rounded-full" />
                  <Skeleton className="w-3/4 h-8 rounded-lg" />
                  <Skeleton className="w-1/2 h-4 rounded-lg" />
                </div>
                <div className="pt-4 border-t border-default-100 flex justify-between">
                  <Skeleton className="w-24 h-4 rounded-lg" />
                  <Skeleton className="w-16 h-4 rounded-lg" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-primary-600 to-primary-800 p-8 rounded-3xl text-white shadow-xl shadow-primary-200/50">
        <div>
          <Heading as="h1" size="4xl" weight="bold" className="text-white mb-2">
            Assignments Management
          </Heading>
          <Text className="text-primary-50 opacity-90 text-lg">
            Create, manage and track student tasks across your classes.
          </Text>
        </div>
        <Button
          size="lg"
          variant="solid"
          className="bg-white text-primary-700 font-bold px-8 py-6 rounded-2xl hover:scale-105 transition-transform"
          startContent={<Icon icon="lucide:plus-circle" width={24} />}
          onPress={() => router.push("/assignments-for-classes/create")}
        >
          Create New Assignment
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Assignments",
            value: stats.total,
            icon: "lucide:book-open",
            color: "text-primary",
            bg: "bg-primary-50 dark:bg-primary-100/10",
          },
          {
            label: "Active Tasks",
            value: stats.published,
            icon: "lucide:play",
            color: "text-success",
            bg: "bg-success-50 dark:bg-success-100/10",
          },
          {
            label: "Drafts",
            value: stats.drafts,
            icon: "lucide:edit-3",
            color: "text-warning",
            bg: "bg-warning-50 dark:bg-warning-100/10",
          },
          {
            label: "Closed",
            value: stats.closed,
            icon: "lucide:archive",
            color: "text-danger",
            bg: "bg-danger-50 dark:bg-danger-100/10",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-md hover:shadow-lg transition-shadow rounded-2xl"
          >
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <Icon icon={stat.icon} width={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-default-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-default-900 dark:text-default-100">
                  {stat.value}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters Hub */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-content1 p-4 rounded-2xl shadow-sm border border-default-200">
        <Input
          placeholder="Search assignment title..."
          startContent={
            <Icon icon="lucide:search" className="text-default-400" />
          }
          className="md:max-w-md"
          value={searchQuery}
          onValueChange={setSearchQuery}
          variant="flat"
        />
        <Select
          placeholder="Filter by Class"
          className="md:max-w-xs"
          selectedKeys={[selectedClassId]}
          onChange={(e) => setSelectedClassId(e.target.value)}
          variant="flat"
          startContent={<Icon icon="lucide:filter" />}
        >
          <SelectItem key="all" value="all">
            All Classes
          </SelectItem>
          {(classesData || []).map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name}
            </SelectItem>
          ))}
        </Select>
        <div className="flex-1" />
        <Text color="muted" size="sm">
          Showing {filteredAssignments.length} results
        </Text>
      </div>

      {/* Assignments List Section */}
      {isAssignmentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-appearance-in">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 rounded-3xl border-none shadow-md">
              <CardBody className="p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-20 h-6 rounded-full" />
                  <Skeleton className="w-3/4 h-8 rounded-lg" />
                  <Skeleton className="w-1/2 h-4 rounded-lg" />
                </div>
                <div className="pt-4 border-t border-default-100 flex justify-between">
                  <Skeleton className="w-24 h-4 rounded-lg" />
                  <Skeleton className="w-16 h-4 rounded-lg" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-default-200 bg-default-50/50 rounded-3xl">
          <div className="bg-default-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="lucide:layers"
              className="text-default-400"
              width={48}
            />
          </div>
          <Heading as="h3" size="xl" className="mb-2">
            No assignments found
          </Heading>
          <Text color="muted" className="mb-8 max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search query or class filter."
              : "Start by creating your first task for this class."}
          </Text>
          <Button
            color="primary"
            onPress={() => router.push("/assignments-for-classes/create")}
          >
            Create Assignment
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const statusCfg = getStatusConfig(assignment.status);
            return (
              <Card
                key={assignment.id}
                className="group border-none shadow-md hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1"
              >
                <div
                  className={`h-2 w-full bg-${statusCfg.color}-500 group-hover:bg-${statusCfg.color}-600 transition-colors opacity-10 group-hover:opacity-100`}
                />
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      content=""
                      color={statusCfg.color}
                      shape="circle"
                      placement="top-right"
                      isInvisible={assignment.status !== "published"}
                    >
                      <div className="bg-primary-50 text-primary-600 p-3 rounded-2xl">
                        <Icon icon="lucide:clipboard-list" width={24} />
                      </div>
                    </Badge>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          className="text-default-400 group-hover:text-default-900"
                        >
                          <Icon icon="lucide:more-vertical" width={20} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Assignment actions">
                        <DropdownItem
                          key="view"
                          startContent={<Icon icon="lucide:eye" />}
                          onPress={() =>
                            router.push(
                              `/assignments-for-classes/${assignment.id}`,
                            )
                          }
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit-3" />}
                          onPress={() =>
                            router.push(
                              `/assignments-for-classes/${assignment.id}/edit`,
                            )
                          }
                        >
                          Edit Content
                        </DropdownItem>
                        <DropdownItem
                          key="submissions"
                          startContent={<Icon icon="lucide:users" />}
                          onPress={() =>
                            router.push(
                              `/assignments-for-classes/${assignment.id}?tab=submissions`,
                            )
                          }
                        >
                          View Submissions
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash-2" />}
                          onPress={() =>
                            handleDeleteClick(assignment.id, assignment.title)
                          }
                        >
                          Delete Assignment
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className="mb-6">
                    <Chip
                      size="sm"
                      variant="dot"
                      color={statusCfg.color}
                      className="mb-2 font-semibold capitalize"
                      startContent={
                        <Icon icon={statusCfg.icon} className="mr-1" />
                      }
                    >
                      {statusCfg.label}
                    </Chip>
                    <h3 className="text-xl font-bold text-default-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-default-500 flex items-center gap-1">
                      <Icon icon="lucide:school" width={14} />
                      {assignment.className}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-default-50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                          Due Date
                        </span>
                        <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                          {assignment.dueDate
                            ? format(new Date(assignment.dueDate), "dd MMM")
                            : "No Date"}
                        </span>
                      </div>
                      <p className="font-medium text-default-700 dark:text-default-300">
                        {assignment.dueDate
                          ? format(new Date(assignment.dueDate), "EEEE, p")
                          : "Evergreen"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-default-100">
                      <div className="flex items-center gap-2 text-default-500">
                        <Icon icon="lucide:users" width={16} />
                        <span className="text-xs font-medium">
                          Class Assignment
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-default-400 uppercase tracking-wider">
                          Weight
                        </p>
                        <p className="font-bold text-primary">
                          {assignment.maxScore} pts
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-danger">
                  <Icon icon="lucide:alert-triangle" width={24} />
                  <h3 className="text-xl font-bold">Delete Assignment?</h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p className="text-default-600">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-default-900">
                      &quot;{assignmentToDelete?.title}&quot;
                    </span>
                    ?
                  </p>

                  {submissionCount > 0 && (
                    <Card className="bg-warning-50 border-warning-200 border">
                      <CardBody className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon
                            icon="lucide:alert-circle"
                            className="text-warning-600 flex-shrink-0 mt-0.5"
                            width={20}
                          />
                          <div>
                            <p className="font-semibold text-warning-800 mb-1">
                              Warning: Active Submissions Detected
                            </p>
                            <p className="text-sm text-warning-700">
                              This assignment has{" "}
                              <span className="font-bold">
                                {submissionCount} student submission
                                {submissionCount > 1 ? "s" : ""}
                              </span>
                              . Deleting this assignment will permanently remove
                              all student work and grades.
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  <p className="text-sm text-danger-600 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDelete}
                  isLoading={deleteMutation.isPending}
                  startContent={<Icon icon="lucide:trash-2" />}
                >
                  {submissionCount > 0
                    ? `Delete Anyway (${submissionCount} submissions)`
                    : "Delete Assignment"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
