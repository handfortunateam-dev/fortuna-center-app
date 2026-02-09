"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Button,
  Spinner,
  Avatar,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { StateMessage } from "@/components/state-message";
import { format } from "date-fns";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  clerkId: string;
  createdAt: string;
  updatedAt: string;
}

export default function TeachersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch teachers (users with role TEACHER)
  const {
    data: teachersData,
    isLoading,
    error,
  } = useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await fetch("/api/users?role=TEACHER");
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to fetch teachers");
      return data.data || [];
    },
  });

  // Filter teachers by search query
  const filteredTeachers = useMemo(() => {
    if (!teachersData) return [];

    if (!searchQuery) return teachersData;

    return teachersData.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.clerkId.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [teachersData, searchQuery]);

  if (error) {
    return (
      <StateMessage
        type="error"
        icon="solar:danger-circle-bold-duotone"
        title="Failed to Load Teachers"
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading className="text-3xl font-bold">Teachers</Heading>
          <Text className="text-default-500 mt-1">
            Manage teacher accounts and information
          </Text>
        </div>
      </div>

      {/* Statistics Card */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon
                icon="solar:user-speak-bold-duotone"
                className="w-8 h-8 text-primary"
              />
            </div>
            <div>
              <Text className="text-sm text-default-500">Total Teachers</Text>
              <Heading className="text-2xl font-bold">
                {teachersData?.length || 0}
              </Heading>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <Input
            placeholder="Search by name, email, or Clerk ID..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={
              <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4" />
            }
            isClearable
            onClear={() => setSearchQuery("")}
          />
        </CardBody>
      </Card>

      {/* Teachers Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Icon
              icon="solar:users-group-rounded-bold-duotone"
              className="w-5 h-5 text-primary"
            />
            <Heading className="text-lg font-semibold">
              Teacher Accounts
            </Heading>
          </div>
          <Text className="text-sm text-default-500">
            {filteredTeachers.length}{" "}
            {filteredTeachers.length === 1 ? "teacher" : "teachers"}
          </Text>
        </CardHeader>

        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" label="Loading teachers..." />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-20">
              <StateMessage
                type="empty"
                icon="solar:user-speak-bold-duotone"
                title="No Teachers Found"
                message={
                  searchQuery
                    ? "No teachers match your search criteria."
                    : "No teachers registered yet."
                }
              />
            </div>
          ) : (
            <Table removeWrapper>
              <TableHeader>
                <TableColumn>TEACHER</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>CLERK ID</TableColumn>
                <TableColumn>JOINED DATE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={teacher.image || undefined}
                          name={teacher.name}
                          size="sm"
                          className="shrink-0"
                        />
                        <div>
                          <Text className="font-medium">{teacher.name}</Text>
                          <Text className="text-xs text-default-400">
                            ID: {teacher.id.slice(0, 8)}...
                          </Text>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Text className="text-sm">{teacher.email}</Text>
                    </TableCell>
                    <TableCell>
                      <Text className="text-sm font-mono text-default-500">
                        {teacher.clerkId}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text className="text-sm">
                        {format(new Date(teacher.createdAt), "dd MMM yyyy")}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color="success"
                        variant="flat"
                        size="sm"
                        startContent={
                          <Icon
                            icon="solar:check-circle-bold"
                            className="w-3 h-3"
                          />
                        }
                      >
                        Active
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() =>
                            router.push(
                              `/teacher-classes?teacherId=${teacher.id}`,
                            )
                          }
                          title="View Classes"
                        >
                          <Icon
                            icon="solar:book-bookmark-bold-duotone"
                            className="w-4 h-4"
                          />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() =>
                            router.push(`/assignments-by-teacher/${teacher.id}`)
                          }
                          title="View Assignments"
                        >
                          <Icon
                            icon="solar:document-text-bold-duotone"
                            className="w-4 h-4"
                          />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => router.push(`/users/${teacher.id}`)}
                          title="View Details"
                        >
                          <Icon
                            icon="solar:eye-bold-duotone"
                            className="w-4 h-4"
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
