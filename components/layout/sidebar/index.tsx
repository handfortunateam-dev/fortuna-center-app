"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify/react";
import { MenuItem as MenuItemType } from "@/constants/resource";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

interface MenuItemProps {
  item: MenuItemType;
  isCollapsed: boolean;
  selectedKey: string;
  onClose: () => void;
  icon?: React.ReactNode;
}

const MenuItem = ({
  item,
  isCollapsed,
  selectedKey,
  onClose,
  icon,
}: MenuItemProps) => {
  const hasChildren = item.children && item.children.length > 0;

  // Check if any child is currently selected
  const isChildSelected = item.children?.some(
    (child) => child.key === selectedKey,
  );

  const [isExpanded, setIsExpanded] = useState(() => {
    if (hasChildren && item.children) {
      return isChildSelected;
    }
    return false;
  });

  const isActive = selectedKey === item.key;
  const showActiveState = isActive || isChildSelected;

  const [prevSelectedKey, setPrevSelectedKey] = useState(selectedKey);

  if (selectedKey !== prevSelectedKey) {
    setPrevSelectedKey(selectedKey);
    if (hasChildren && item.children) {
      if (isChildSelected) {
        setIsExpanded(true);
      }
    }
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const navLinkClass = `
    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
    transition-all duration-200 relative group w-full
    ${isCollapsed ? "justify-center" : "justify-between"}
    ${
      showActiveState
        ? "bg-danger-50 text-danger-600 dark:text-danger-400 shadow-sm ring-1 ring-danger-200/50 dark:ring-danger-800/50 backdrop-blur-sm"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
    }
  `;

  // Standard content (Icon + Label + Arrow)
  const NavContent = (
    <>
      <div className="flex items-center gap-3 overflow-hidden">
        {icon || (
          <Icon icon="solar:file-text-bold" className="w-5 h-5 shrink-0" />
        )}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {!isCollapsed && hasChildren && (
          <motion.span
            className="text-gray-400 shrink-0"
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: 1,
              width: "auto",
              rotate: isExpanded ? 0 : -90,
            }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  // Content for collapsed state (Icon only, usually wrapped in Tooltip)
  const collapsedContent = (
    <div className="flex justify-center w-full">
      {icon || (
        <Icon icon="solar:file-text-bold" className="w-5 h-5 shrink-0" />
      )}
    </div>
  );

  let renderItem;

  if (isCollapsed && hasChildren) {
    // Dropdown for collapsed menu with children
    renderItem = (
      <Dropdown placement="right-start" offset={20}>
        <DropdownTrigger>
          <div className={`${navLinkClass} cursor-pointer`}>
            <Tooltip
              content={item.label}
              placement="right"
              classNames={{
                base: "hidden lg:block",
                content:
                  "bg-gray-900 dark:bg-white text-white dark:text-black text-sm px-3 py-1.5 rounded-lg shadow-lg",
              }}
            >
              {collapsedContent}
            </Tooltip>
          </div>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={item.label}
          className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg"
        >
          {(item.children || []).map((child: MenuItemType) => (
            <DropdownItem
              key={child.key}
              href={child.route}
              startContent={
                child.icon ? (
                  typeof child.icon === "function" ? (
                    <child.icon className="w-4 h-4 shrink-0" />
                  ) : typeof child.icon === "string" ? (
                    <Icon icon={child.icon} className="w-4 h-4 shrink-0" />
                  ) : (
                    child.icon
                  )
                ) : (
                  <Icon
                    icon="solar:file-text-bold"
                    className="w-4 h-4 shrink-0"
                  />
                )
              }
              className={
                selectedKey === child.key
                  ? "bg-primary/10 text-primary font-medium"
                  : ""
              }
            >
              {child.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  } else if (hasChildren) {
    // Expandable item (full sidebar)
    renderItem = (
      <div onClick={toggleExpand} className={`${navLinkClass} cursor-pointer`}>
        {NavContent}
      </div>
    );
  } else if (isCollapsed) {
    // Simple link (collapsed, no children)
    renderItem = (
      <Link href={item.route ?? "/"} onClick={onClose} className={navLinkClass}>
        <Tooltip
          content={item.label}
          placement="right"
          classNames={{
            base: "hidden lg:block",
            content:
              "bg-gray-900 dark:bg-white text-white dark:text-black text-sm px-3 py-1.5 rounded-lg shadow-lg",
          }}
        >
          {collapsedContent}
        </Tooltip>
      </Link>
    );
  } else {
    // Simple link (expanded)
    renderItem = (
      <Link href={item.route ?? "/"} onClick={onClose} className={navLinkClass}>
        {NavContent}
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      {renderItem}
      {/* Render children for Expanded Sidebar with Smooth Transition */}
      <AnimatePresence>
        {!isCollapsed && hasChildren && isExpanded && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-800 pl-2">
              {item.children.map((child: MenuItemType) => (
                <MenuItem
                  key={child.key}
                  item={child}
                  isCollapsed={isCollapsed}
                  selectedKey={selectedKey}
                  onClose={onClose}
                  icon={
                    child.icon ? (
                      typeof child.icon === "function" ? (
                        <child.icon className="w-5 h-5 shrink-0" />
                      ) : typeof child.icon === "string" ? (
                        <Icon icon={child.icon} className="w-5 h-5 shrink-0" />
                      ) : (
                        child.icon
                      )
                    ) : (
                      <Icon
                        icon="solar:file-text-bold"
                        className="w-5 h-5 shrink-0"
                      />
                    )
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Sidebar({ isOpen, onClose, isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { menuItems, isLoading } = useAccessControl();
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force expand on mobile
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  // Helper to find the best matching selected key (longest matching route)
  const findSelectedKey = (items: MenuItemType[], path: string): string => {
    let bestMatch = { key: "", length: 0 };

    const traverse = (menuList: MenuItemType[]) => {
      for (const item of menuList) {
        if (item.route) {
          const isExact = item.route === path;
          // Ensure prefix match includes a slash to prevent partial word matches (e.g. /user vs /users)
          const isPrefix =
            item.route !== "/" && path.startsWith(item.route + "/");

          if (isExact || isPrefix) {
            if (item.route.length > bestMatch.length) {
              bestMatch = { key: item.key, length: item.route.length };
            }
          }
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    };

    traverse(items);
    return bestMatch.key;
  };

  const selectedKey = findSelectedKey(menuItems, pathname);

  // Show skeleton while loading session
  if (isLoading) {
    return (
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-white dark:bg-gray-950/80 backdrop-blur-md
          border-r border-gray-200/50 dark:border-gray-800/50
          transform transition-all duration-300 ease-in-out shadow-lg 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col
          ${effectiveCollapsed ? "w-20" : "w-80"}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50 dark:border-gray-800/50 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[1, 2, 3, 4, 5,6,7,8,9,10].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen 
          bg-white/80 dark:bg-gray-950/80 backdrop-blur-md 
          border-r border-gray-200/50 dark:border-gray-800/50
          transform transition-all duration-300 ease-in-out shadow-lg
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col
          ${effectiveCollapsed ? "w-20" : "w-80"}
        `}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center h-16 border-b border-gray-200/50 dark:border-gray-800/50 shrink-0 backdrop-blur-md bg-white/50 dark:bg-gray-950/50 transition-all duration-300 ${effectiveCollapsed ? "justify-center px-2" : "justify-between px-4"}`}
        >
          <Link
            href="/"
            className={`flex items-center gap-3 transition-all duration-300 ${effectiveCollapsed ? "justify-center" : "justify-start"}`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0 overflow-hidden relative">
              <img
                src="/android-chrome-192x192.png"
                alt="Fortuna Center"
                className="w-full h-full object-cover"
              />
            </div>
            <AnimatePresence>
              {!effectiveCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap overflow-hidden"
                >
                  Fortuna Center
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
            aria-label="Close sidebar"
          >
            <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <MenuItem
              key={item.key}
              item={item}
              isCollapsed={effectiveCollapsed}
              selectedKey={selectedKey}
              onClose={onClose}
              icon={
                item.icon ? (
                  typeof item.icon === "function" ? (
                    <item.icon className="w-5 h-5 shrink-0" />
                  ) : typeof item.icon === "string" ? (
                    <Icon icon={item.icon} className="w-5 h-5 shrink-0" />
                  ) : (
                    item.icon
                  )
                ) : (
                  <Icon
                    icon="solar:file-text-bold"
                    className="w-5 h-5 shrink-0"
                  />
                )
              }
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 shrink-0">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-primary dark:hover:text-primary transition-all duration-200 ${
              effectiveCollapsed ? "justify-center" : "justify-start"
            }`}
            target="_blank"
          >
            <Icon icon="lucide:external-link" className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!effectiveCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Go to Public Home
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </aside>
    </>
  );
}
