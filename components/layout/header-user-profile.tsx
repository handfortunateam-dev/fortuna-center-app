"use client";

import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/react";
import { signOut } from "next-auth/react";
import { Text } from "@/components/text";
import { Icon } from "@iconify/react";
import { useAccessControl } from "@/lib/hooks/useAccessControl";

export const HeaderUserProfile = () => {
  const { userName, userEmail, role, isAdmin, isLoading } = useAccessControl();

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  // Skeleton saat loading
  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform cursor-pointer"
          color={isAdmin ? "primary" : "secondary"}
          name={userName || "User"}
          size="sm"
          showFallback
          fallback={
            <Icon icon="solar:user-bold" className="w-4 h-4 text-default-500" />
          }
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User actions" variant="flat">
        <DropdownSection showDivider>
          <DropdownItem
            key="profile"
            className="h-auto gap-2 py-3"
            isReadOnly
            textValue="Profile Info"
          >
            <div className="flex flex-col gap-1">
              <Text className="font-semibold text-foreground">
                {userName || "User"}
              </Text>
              <Text className="text-xs text-default-500">{userEmail}</Text>
              <Chip
                size="sm"
                color={isAdmin ? "primary" : "secondary"}
                variant="flat"
                className="mt-1"
                startContent={
                  <Icon
                    icon={
                      isAdmin ? "solar:shield-user-bold" : "solar:user-bold"
                    }
                    className="w-3 h-3"
                  />
                }
              >
                {role}
              </Chip>
            </div>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          <DropdownItem
            key="profile"
            href="/profile"
            startContent={
              <Icon icon="solar:user-circle-bold" className="w-4 h-4" />
            }
          >
            Profil Saya
          </DropdownItem>
          {/* <DropdownItem
            key="settings"
            href="/settings"
            startContent={
              <Icon icon="solar:settings-bold" className="w-4 h-4" />
            }
          >
            Pengaturan
          </DropdownItem> */}
          <DropdownItem
            key="logout"
            color="danger"
            onPress={handleLogout}
            startContent={
              <Icon icon="solar:logout-2-bold" className="w-4 h-4" />
            }
          >
            Keluar
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
