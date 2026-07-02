"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, ModalContent, ModalBody, Input, Kbd } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  getNavigationByRole,
  type AdminNavigationItem,
} from "@/config/navigationItem";

interface CommandBarProps {
  userRole?: string;
}

interface FlatNavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  breadcrumb?: string;
}

export default function CommandBar({ userRole }: CommandBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Detect OS for keyboard shortcut display
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // Flatten navigation items with breadcrumb (regular function to avoid hoisting issues)
  const flattenNavigation = (
    items: AdminNavigationItem[],
    breadcrumb = "",
  ): FlatNavigationItem[] => {
    const result: FlatNavigationItem[] = [];

    items.forEach((item) => {
      const currentBreadcrumb = breadcrumb
        ? `${breadcrumb} > ${item.name}`
        : item.name;

      if (item.href) {
        result.push({
          name: item.name,
          href: item.href,
          icon: item.icon,
          breadcrumb: currentBreadcrumb,
        });
      }

      if (item.children) {
        result.push(...flattenNavigation(item.children, currentBreadcrumb));
      }
    });

    return result;
  };

  // Get navigation items based on user role
  const navigationItems = useMemo(() => {
    if (!userRole) return [];
    const roleNavigation = getNavigationByRole(userRole);
    return flattenNavigation(roleNavigation);
  }, [userRole]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!search) return navigationItems;

    const searchLower = search.toLowerCase();
    return navigationItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.breadcrumb?.toLowerCase().includes(searchLower),
    );
  }, [search, navigationItems]);

  // Navigation handlers (defined before useEffect)
  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      setIsOpen(false);
      setSearch("");
      setSelectedIndex(0);
    },
    [router],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearch("");
    setSelectedIndex(0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // ESC to close
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }

      // Arrow navigation when modal is open
      if (isOpen && filteredItems.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0,
          );
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1,
          );
        }
        if (e.key === "Enter") {
          e.preventDefault();
          handleNavigate(filteredItems[selectedIndex].href);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleNavigate, handleClose]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 hover:bg-default-200 transition-colors border border-default-200"
      >
        <Icon
          icon="solar:magnifier-linear"
          className="text-lg text-default-500"
        />
        <span className="text-sm text-default-500 hidden sm:inline">
          Search...
        </span>
        <div className="hidden sm:flex items-center gap-1">
          <Kbd keys={isMac ? ["command"] : ["ctrl"]}>
            {isMac ? "⌘" : "Ctrl"}
          </Kbd>
          <Kbd>K</Kbd>
        </div>
      </button>

      {/* Command Palette Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="2xl"
        placement="top"
        classNames={{
          base: "mt-20",
          backdrop: "bg-black/50 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          <ModalBody className="p-0">
            {/* Search Input */}
            <div className="p-4 border-b border-default-200">
              <Input
                autoFocus
                placeholder="Search for pages, features..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startContent={
                  <Icon
                    icon="solar:magnifier-linear"
                    className="text-xl text-default-400"
                  />
                }
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-none shadow-none",
                }}
              />
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center">
                  <Icon
                    icon="solar:ghost-linear"
                    className="text-5xl text-default-300 mx-auto mb-3"
                  />
                  <p className="text-default-500 text-sm">
                    {search
                      ? "No results found"
                      : "No navigation items available"}
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {filteredItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigate(item.href)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                          index === selectedIndex
                            ? "bg-primary/10 border-l-2 border-primary"
                            : "hover:bg-default-100"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            index === selectedIndex
                              ? "bg-primary/20"
                              : "bg-default-100"
                          }`}
                        >
                          <IconComponent
                            className={`text-lg ${
                              index === selectedIndex
                                ? "text-primary"
                                : "text-default-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p
                            className={`text-sm font-medium ${
                              index === selectedIndex
                                ? "text-primary"
                                : "text-default-900"
                            }`}
                          >
                            {item.name}
                          </p>
                          {item.breadcrumb && (
                            <p className="text-xs text-default-400 mt-0.5">
                              {item.breadcrumb}
                            </p>
                          )}
                        </div>
                        {index === selectedIndex && (
                          <Kbd className="hidden sm:inline-flex">↵</Kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-default-200 bg-default-50">
              <div className="flex items-center justify-between text-xs text-default-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Kbd>↵</Kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Kbd>ESC</Kbd>
                    <span>Close</span>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
