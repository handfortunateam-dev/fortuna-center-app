"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";
// import {
//   ArrowLeft,
//   Mail,
//   Calendar,
//   User,
//   Shield,
//   Phone,
//   Globe,
// } from "lucide-react";
import { Icon } from "@iconify/react";
import { useUser } from "@/services/usersService";
import { format } from "date-fns";

interface UserDetailProps {
  id: string;
}

export default function UserDetail({ id }: UserDetailProps) {
  const router = useRouter();
  const { data: userData, isLoading, isError, error } = useUser(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Loading user details..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p className="text-lg font-semibold">Error loading user</p>
        <p className="text-sm">
          {(error as Error)?.message || "Failed to fetch user data"}
        </p>
        <Button
          className="mt-4"
          color="primary"
          variant="flat"
          onPress={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const user = userData?.data;

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          aria-label="Go back"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row gap-5 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <Avatar
            src={user.imageUrl}
            className="w-24 h-24 text-large"
            isBordered
            color="primary"
          />
          <div className="flex flex-col gap-2 flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.fullName}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  @{user.username || "username"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="solid"
                  onPress={() => router.push(`/users/${id}/edit`)}
                >
                  Edit User
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {user.emailVerified ? (
                <Chip
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<Icon icon="lucide:shield" className="w-3 h-3" />}
                >
                  Verified
                </Chip>
              ) : (
                <Chip color="warning" variant="flat" size="sm">
                  Unverified
                </Chip>
              )}
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="lucide:user" className="w-5 h-5 text-blue-500" />
              Personal Information
            </h3>
            <div className="space-y-3 pl-7">
              <div>
                <p className="text-sm text-gray-500">First Name</p>
                <p className="font-medium">{user.firstName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Name</p>
                <p className="font-medium">{user.lastName || "-"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="lucide:mail" className="w-5 h-5 text-blue-500" />
              Contact Information
            </h3>
            <div className="space-y-3 pl-7">
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{user.email || "-"}</p>
              </div>
              {user.phoneNumbers && user.phoneNumbers.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <div className="flex flex-col gap-1">
                    {user.phoneNumbers.map((phone, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="font-medium">{phone.phoneNumber}</span>
                        {phone.verified && (
                          <Icon icon="lucide:check-circle-2" className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="lucide:calendar" className="w-5 h-5 text-blue-500" />
              Activity
            </h3>
            <div className="space-y-3 pl-7">
              <div>
                <p className="text-sm text-gray-500">Joined On</p>
                <p className="font-medium">
                  {user.createdAt
                    ? format(new Date(user.createdAt), "MMMM dd, yyyy")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Sign In</p>
                <p className="font-medium">
                  {user.lastSignInAt
                    ? format(new Date(user.lastSignInAt), "MMMM dd, yyyy HH:mm")
                    : "Never"}
                </p>
              </div>
            </div>
          </div>

          {user.externalAccounts && user.externalAccounts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="lucide:globe" className="w-5 h-5 text-blue-500" />
                Connected Accounts
              </h3>
              <div className="space-y-3 pl-7">
                {user.externalAccounts.map((acc, idx) => (
                  <div key={idx}>
                    <p className="text-sm text-gray-500 capitalize">
                      {acc.provider}
                    </p>
                    <p className="font-medium">{acc.emailAddress}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
