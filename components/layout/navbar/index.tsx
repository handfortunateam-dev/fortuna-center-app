"use client";

import React from "react";
import Image from "next/image";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Skeleton,
} from "@heroui/react";
import { UserButton, useUser, SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  NavigationItem,
  publicMenuItems,
  systemMenuItems,
} from "@/config/navigationItem";
import { useSearchContext } from "@/providers/SearchProvider";
import { Text } from "@/components/ui/Text";
import AuthButtons from "./AuthButtons";
import { Icon } from "@iconify/react";
import HeaderDateTimeWidget from "@/components/HeaderDateTimeWidget";
import { useTheme } from "next-themes";

const mobileIndentClasses = ["", "pl-5", "pl-9", "pl-12", "pl-16"];

const getMobileIndent = (depth: number) => {
  const idx =
    depth < mobileIndentClasses.length
      ? depth
      : mobileIndentClasses.length - 1;
  return mobileIndentClasses[idx];
};

interface NavbarProps {
  // Mode configuration
  mode?: "public" | "dashboard";

  // Dashboard mode props
  onMenuClick?: () => void;
  onToggleCollapse?: () => void;
  sidebarCollapsed?: boolean;

  // Public mode props
  logo?: string;
  logoDark?: string;
  brandName?: string;
  menuItems?: NavigationItem[];
  showThemeToggle?: boolean;
  showAuth?: boolean;
}

export default function Navbar({
  mode = "public",
  onMenuClick,
  onToggleCollapse,
  sidebarCollapsed = false,
  logo,
  logoDark,
  brandName = "FORTUNA CENTER",
  menuItems = publicMenuItems,
  showThemeToggle = true,
  showAuth = true,
}: NavbarProps) {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { setIsOpen: openSearch } = useSearchContext();
  const { theme, setTheme } = useTheme();
  const [openMenuKey, setOpenMenuKey] = React.useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null);
  const menuCloseTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const clearMenuCloseTimeout = () => {
    if (menuCloseTimeout.current) {
      clearTimeout(menuCloseTimeout.current);
      menuCloseTimeout.current = null;
    }
  };

  const openMenu = (key: string) => {
    clearMenuCloseTimeout();
    setOpenMenuKey(key);
  };

  const closeMenuImmediately = () => {
    clearMenuCloseTimeout();
    setOpenMenuKey(null);
    setActiveSubmenu(null);
  };

  const scheduleMenuClose = () => {
    clearMenuCloseTimeout();
    menuCloseTimeout.current = setTimeout(() => {
      setOpenMenuKey(null);
      setActiveSubmenu(null);
    }, 180);
  };

  React.useEffect(() => {
    return () => {
      clearMenuCloseTimeout();
    };
  }, []);

  const handleNavigate = (href: string) => {
    router.push(href);
    closeMenuImmediately();
  };

  const renderMobileMenuItems = (
    items: NavigationItem[],
    depth = 0
  ): React.ReactNode[] => {
    return items.flatMap((item) => {
      const indentClass = getMobileIndent(depth);
      const entry = (
        <DropdownItem
          key={`mobile-${item.key}-${depth}`}
          startContent={item.icon}
          className={`${indentClass} ${
            depth > 0 ? "text-sm text-gray-600 dark:text-gray-300" : ""
          }`}
          onPress={() => handleNavigate(item.href)}
        >
          {item.label}
        </DropdownItem>
      );

      if (!item.children?.length) {
        return entry;
      }

      return [entry, ...renderMobileMenuItems(item.children, depth + 1)];
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Dashboard mode navbar
  if (mode === "dashboard") {
    return (
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Icon icon="material-symbols:menu" className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? (
                <Icon
                  icon="material-symbols:chevron-right"
                  className="w-5 h-5"
                />
              ) : (
                <Icon icon="material-symbols:menu" className="w-5 h-5" />
              )}
            </button>

            <div className="ml-4">
              <HeaderDateTimeWidget />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showThemeToggle && (
              <Button
                isIconOnly
                variant="light"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/20 rounded-full w-10 h-10"
              >
                {theme === "dark" ? (
                  <Icon icon="solar:sun-bold" className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Icon icon="solar:moon-bold" className="w-5 h-5" />
                )}
              </Button>
            )}
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              {!isLoaded ? (
                // Loading state
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                    <Skeleton className="h-3 w-32 rounded-lg" />
                  </div>
                  <Skeleton className="rounded-full w-10 h-10" />
                </div>
              ) : (
                // Loaded state with user info
                <SignedIn>
                  <div className="hidden sm:block text-right">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.fullName || user?.firstName || "-"}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.primaryEmailAddress?.emailAddress || "-"}
                    </Text>
                  </div>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      },
                    }}
                  />
                </SignedIn>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Public mode navbar
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-12">
            {/* Logo */}
            <NextLink href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden transition-transform group-hover:scale-105 shadow-sm bg-white p-1">
                <div className="relative w-full h-full">
                  <Image
                    src={logo || logoDark || "/apple-touch-icon.png"}
                    alt={brandName}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight group-hover:text-secondary dark:group-hover:text-secondary transition-colors">
                {brandName}
              </span>
            </NextLink>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => {
                // Handle items with children (Dropdown)
                if (item.children && item.children.length > 0) {
                  const isMenuOpen = openMenuKey === item.key;

                  return (
                    <div
                      key={item.key}
                      className="relative"
                      onMouseEnter={() => openMenu(item.key)}
                      onMouseLeave={scheduleMenuClose}
                    >
                      <Button
                        variant="light"
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/20 transition-all px-4 py-2 h-auto rounded-full"
                        endContent={
                          <Icon
                            icon="lucide:chevron-down"
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isMenuOpen ? "rotate-180 text-secondary" : ""
                            }`}
                          />
                        }
                        onPress={() => handleNavigate(item.href)}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          {item.label}
                        </div>
                      </Button>

                      {isMenuOpen && (
                        <div
                          className="absolute left-0 top-full mt-3 z-40 min-w-[280px] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-2 space-y-1"
                          onMouseEnter={() => openMenu(item.key)}
                          onMouseLeave={scheduleMenuClose}
                        >
                          {item.children.map((child) => {
                            const hasGrandchildren = !!child.children?.length;
                            const showSubmenu =
                              hasGrandchildren &&
                              activeSubmenu === child.key;

                            return (
                              <div
                                key={child.key}
                                className="relative"
                                onMouseEnter={() => {
                                  if (hasGrandchildren) {
                                    setActiveSubmenu(child.key);
                                  } else {
                                    setActiveSubmenu(null);
                                  }
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleNavigate(child.href)}
                                  className="w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left hover:bg-secondary/10 dark:hover:bg-secondary/20 transition-colors"
                                >
                                  {child.icon}
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {child.label}
                                    </p>
                                    {child.description && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {child.description}
                                      </p>
                                    )}
                                  </div>
                                  {hasGrandchildren && (
                                    <Icon
                                      icon="lucide:chevron-right"
                                      className={`w-4 h-4 transition-colors ${
                                        showSubmenu
                                          ? "text-secondary"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  )}
                                </button>

                                {showSubmenu && (
                                  <div
                                    className="absolute left-full top-0 ml-3 z-50 min-w-[230px] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl py-2 px-1"
                                    onMouseEnter={() => {
                                      openMenu(item.key);
                                      setActiveSubmenu(child.key);
                                    }}
                                    onMouseLeave={scheduleMenuClose}
                                  >
                                    {child.children?.map((grand) => (
                                      <button
                                        key={grand.key}
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleNavigate(grand.href);
                                        }}
                                        className="w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left text-sm hover:bg-secondary/10 dark:hover:bg-secondary/20 hover:text-secondary transition-colors"
                                      >
                                        {grand.icon}
                                        <div>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {grand.label}
                                          </p>
                                          {grand.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {grand.description}
                                            </p>
                                          )}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular link for all other items
                return (
                  <NextLink
                    key={item.key}
                    href={item.href}
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/20 transition-all flex items-center gap-2 px-4 py-2 rounded-full"
                  >
                    {item.icon}
                    {item.label}
                  </NextLink>
                );
              })}
            </div>
          </div>

          {/* Right: Theme Toggle, Mobile Menu, Auth */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {showThemeToggle && (
              <Button
                isIconOnly
                variant="light"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/20 rounded-full w-10 h-10"
              >
                {theme === "dark" ? (
                  <Icon icon="solar:sun-bold" className="w-5 h-5" />
                ) : (
                  <Icon icon="solar:moon-bold" className="w-5 h-5" />
                )}
              </Button>
            )}

            {/* Mobile Menu - Dropdown */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  className="md:hidden text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/20 rounded-full w-10 h-10"
                  aria-label="Menu"
                >
                  <Icon icon="solar:hamburger-menu-bold" className="w-6 h-6" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Mobile menu"
                className="p-2"
                itemClasses={{
                  base: "rounded-lg data-[hover=true]:bg-secondary/10 dark:data-[hover=true]:bg-secondary/20 data-[hover=true]:text-secondary dark:data-[hover=true]:text-secondary py-3",
                }}
              >
                <DropdownSection title="Navigation" showDivider>
                  {renderMobileMenuItems(menuItems)}
                </DropdownSection>

                {isSignedIn && systemMenuItems.length > 0 ? (
                  <DropdownSection title="System" showDivider>
                    {systemMenuItems.map((item) => (
                      <DropdownItem
                        key={item.key}
                        startContent={item.icon}
                        onPress={() => router.push(item.href)}
                      >
                        {item.label}
                      </DropdownItem>
                    ))}
                  </DropdownSection>
                ) : null}

                {!isSignedIn ? (
                  <DropdownSection title="Account">
                    <DropdownItem
                      key="login"
                      onPress={() => router.push("/auth/login")}
                      startContent={<Icon icon="solar:login-2-bold" />}
                    >
                      Login
                    </DropdownItem>
                    <DropdownItem
                      key="signup"
                      onPress={() => router.push("/auth/signup")}
                      startContent={<Icon icon="solar:user-plus-bold" />}
                    >
                      Sign Up
                    </DropdownItem>
                  </DropdownSection>
                ) : null}
              </DropdownMenu>
            </Dropdown>

            {/* Auth Buttons */}
            {showAuth && (
              <div className="hidden md:block">
                <AuthButtons />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
