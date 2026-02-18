"use client";

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useGetIdentity } from "@/hooks/useGetIdentity";
import { Toast } from "@/components/toast";

import { useClerk } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";

export default function LocalUserMenu() {
  const { user, loading } = useGetIdentity();
  const router = useRouter();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      // 1. Destroy local session (if any)
      await apiClient.post("/auth/logout");

      // 2. Clear query cache
      queryClient.clear();

      // 3. Destroy Clerk session & redirect
      await signOut(() => router.push("/auth/login"));

      Toast({
        title: "Success",
        description: "Logged out successfully",
        color: "success",
      });
    } catch (error) {
      console.error("Logout failed", error);
      // Fallback redirect
      router.push("/auth/login");
    }
  };

  if (loading) return <Skeleton className="h-10 w-10 rounded-full" />;

  if (!user) return null;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="secondary"
          name={user.name}
          size="sm"
          src={user.image || undefined}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold">{user.email}</p>
        </DropdownItem>
        <DropdownItem
          key="settings"
          onPress={() => router.push("/my-settings")}
        >
          My Settings
        </DropdownItem>
        <DropdownItem key="logout" color="danger" onPress={handleLogout}>
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
