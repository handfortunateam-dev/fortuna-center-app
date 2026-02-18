"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Icon } from "@iconify/react";
import { HeaderUserProfile } from "./header-user-profile";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import CommandBar from "@/components/CommandBar";

interface HeaderProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export function Header({
  onMenuClick,
  onToggleCollapse,
  isCollapsed,
}: HeaderProps) {
  const { userName, role, isAdmin, isLoading } = useAccessControl();

  // ✅ Ambil nilai awal saat komponen pertama kali di-mount
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" && !htmlElement.classList.contains("dark")) {
      htmlElement.classList.add("dark");
    } else if (
      savedTheme === "light" &&
      htmlElement.classList.contains("dark")
    ) {
      htmlElement.classList.remove("dark");
    }

    const observer = new MutationObserver(() => {
      const isDarkMode = htmlElement.classList.contains("dark");
      setIsDark(isDarkMode);
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains("dark")) {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <Navbar
      isBordered
      maxWidth="full"
      className="bg-white dark:bg-gray-950  border-gray-200 dark:border-gray-800"
      classNames={{
        wrapper: "px-4 gap-2",
      }}
    >
      <NavbarBrand className="flex items-center gap-2">
        {/* Mobile Menu Button */}
        <Button
          isIconOnly
          variant="light"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Icon icon="solar:hamburger-menu-bold" className="w-6 h-6" />
        </Button>

        {/* Collapse/Expand Button - Desktop Only */}
        <Button
          isIconOnly
          variant="light"
          onClick={onToggleCollapse}
          className="hidden lg:flex"
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? (
            <Icon
              icon="solar:sidebar-minimalistic-outline"
              className="w-5 h-5"
            />
          ) : (
            <Icon icon="solar:sidebar-minimalistic-bold" className="w-5 h-5" />
          )}
        </Button>

        {/* Dashboard Title - Responsive to sidebar state */}
        <div className="hidden sm:flex flex-col ml-4">
          {isLoading ? (
            <>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {isAdmin ? "Admin Dashboard" : "Dashboard"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selamat datang, {userName || "User"}
              </p>
            </>
          )}
        </div>
      </NavbarBrand>

      <NavbarContent justify="end" className="flex gap-2">
        {/* Command Bar */}
        <NavbarItem>
          <CommandBar userRole={role} />
        </NavbarItem>

        {/* Theme Toggle */}
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Icon icon="solar:sun-bold" className="w-5 h-5 text-yellow-500" />
            ) : (
              <Icon icon="solar:moon-bold" className="w-5 h-5 text-gray-600" />
            )}
          </Button>
        </NavbarItem>

        {/* User Dropdown */}
        <NavbarItem>
          <HeaderUserProfile />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
