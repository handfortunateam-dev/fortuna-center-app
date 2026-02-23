"use client";

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Destroy local session (if any)
      await apiClient.post("/auth/logout");

      // 2. Cancel any in-flight queries to prevent them from re-populating the
      //    cache with the old user's data after we clear it.
      await queryClient.cancelQueries();

      // 3. Clear query cache so the next user gets a fresh fetch
      queryClient.clear();

      // 4. Clear persisted role-view state so the next user doesn't inherit it
      if (typeof window !== "undefined") {
        localStorage.removeItem("multiRoleView");
        document.cookie = "multiRoleView=; path=/; max-age=0";
      }

      // 5. Destroy Clerk session & redirect
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
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  if (loading) return <Skeleton className="h-10 w-10 rounded-full" />;

  if (!user) return null;

  return (
    <>
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
          <DropdownItem key="logout" color="danger" onPress={onOpen}>
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader>Confirm Logout</ModalHeader>
          <ModalBody>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to log out?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isLoggingOut}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleLogout}
              isLoading={isLoggingOut}
            >
              Log Out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
