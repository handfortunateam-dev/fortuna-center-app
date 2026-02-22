"use client";

import React from "react";
import Image from "next/image";
import { Button, Skeleton } from "@heroui/react";
import { UserButton, useUser, SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  NavigationItem,
  publicMenuItems,
  systemMenuItems,
} from "@/config/navigationItem";
import { useSearchContext } from "@/providers/SearchProvider";
import { Text } from "@/components/text";
import AuthButtons from "./AuthButtons";
import { Icon } from "@iconify/react";
import HeaderDateTimeWidget from "@/components/HeaderDateTimeWidget";
import CommandBar from "@/components/CommandBar";
import { useTheme } from "next-themes";
import LocalUserMenu from "./LocalUserMenu";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { useGetIdentity } from "@/hooks/useGetIdentity";
import { AnimatePresence, motion, PanInfo } from "framer-motion";

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
  const { authProvider } = useAuthProvider();
  const { user, isLoaded, isSignedIn } = useUser();
  const { user: localUser, loading: localLoading } = useGetIdentity();
  const { setIsOpen: openSearch } = useSearchContext();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  // Prevent scrolling when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const [openMenuKey, setOpenMenuKey] = React.useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null);
  const menuCloseTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(
    new Set(),
  );

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderMobileMenuItems = (
    items: NavigationItem[],
    depth = 0,
  ): React.ReactNode[] => {
    return items.flatMap((item) => {
      const indentClass = depth === 0 ? "" : depth === 1 ? "pl-4" : "pl-8";
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedKeys.has(item.key);

      const entry = (
        <div key={`mobile-${item.key}-${depth}`} className="w-full">
          {hasChildren ? (
            <div className="flex flex-col">
              <button
                onClick={() => toggleExpanded(item.key)}
                className={`flex items-center justify-between w-full py-3 ${indentClass} text-default-600 font-medium hover:text-primary transition-colors`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <Icon
                  icon="lucide:chevron-down"
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Animated/Conditional Children */}
              <div
                className={`flex flex-col border-l-2 border-default-100 ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {renderMobileMenuItems(item.children!, depth + 1)}
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                handleNavigate(item.href);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 py-3 ${indentClass} text-default-600 hover:text-primary transition-colors`}
            >
              {item.icon}
              <span className="font-medium text-lg">{item.label}</span>
            </button>
          )}
        </div>
      );

      return [entry];
    });
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
              <HeaderDateTimeWidget compact={!sidebarCollapsed} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Command Bar (Ctrl+K) */}
            <div className="hidden sm:block">
              <CommandBar userRole={localUser?.role} />
            </div>

            {showThemeToggle && (
              <Button
                isIconOnly
                variant="light"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/20 rounded-full w-10 h-10"
              >
                {theme === "dark" ? (
                  <Icon
                    icon="solar:sun-bold"
                    className="w-5 h-5 text-yellow-500"
                  />
                ) : (
                  <Icon icon="solar:moon-bold" className="w-5 h-5" />
                )}
              </Button>
            )}
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              {authProvider === "clerk" ? (
                !isLoaded ? (
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
                )
              ) : localLoading ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                    <Skeleton className="h-3 w-32 rounded-lg" />
                  </div>
                  <Skeleton className="rounded-full w-10 h-10" />
                </div>
              ) : localUser ? (
                <>
                  <div className="hidden sm:block text-right">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {localUser.name || "-"}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {localUser.email || "-"}
                    </Text>
                  </div>
                  <LocalUserMenu />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Public mode navbar
  return (
    <>
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
              <div className="hidden xl:flex items-center gap-2">
                {menuItems.map((item) => {
                  // ... (keep existing desktop menu rendering logic: lines 266-407)
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
                                hasGrandchildren && activeSubmenu === child.key;

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
                                    onClick={() => {
                                      if (!hasGrandchildren) {
                                        handleNavigate(child.href);
                                      }
                                    }}
                                    className={`w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left hover:bg-secondary/10 dark:hover:bg-secondary/20 transition-colors ${
                                      hasGrandchildren
                                        ? "cursor-default"
                                        : "cursor-pointer"
                                    }`}
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

              {/* Mobile Menu Button - Visible on < xl */}
              <Button
                isIconOnly
                variant="light"
                className="xl:hidden text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/20 rounded-full w-10 h-10"
                aria-label="Menu"
                onPress={() => setIsMobileMenuOpen(true)}
              >
                <Icon icon="solar:hamburger-menu-bold" className="w-6 h-6" />
              </Button>

              {/* Auth Buttons - Visible on xl+ */}
              {showAuth && (
                <div className="hidden xl:block">
                  <AuthButtons />
                </div>
              )}

              {/* User Profile - Visible on xl+ */}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.5 }}
              onDragEnd={(e, { offset, velocity }: PanInfo) => {
                if (offset.x > 100 || velocity.x > 100) {
                  setIsMobileMenuOpen(false);
                }
              }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[80%] max-w-[380px] bg-white dark:bg-gray-950 shadow-2xl flex flex-col rounded-l-2xl xl:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <span className="font-bold text-lg">Menu</span>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setIsMobileMenuOpen(false)}
                >
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-6 h-6 text-default-500"
                  />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {/* User Info Mobile */}
                {authProvider === "clerk"
                  ? isSignedIn && (
                      <div className="mb-4 p-4 bg-default-50 rounded-xl flex items-center gap-3">
                        <UserButton />
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {user?.fullName}
                          </span>
                          <span className="text-xs text-default-500">
                            {user?.primaryEmailAddress?.emailAddress}
                          </span>
                        </div>
                      </div>
                    )
                  : localUser && (
                      <div className="mb-4 p-4 bg-default-50 rounded-xl flex items-center gap-3">
                        <LocalUserMenu />
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {localUser.name}
                          </span>
                          <span className="text-xs text-default-500">
                            {localUser.email}
                          </span>
                        </div>
                      </div>
                    )}

                {renderMobileMenuItems(menuItems)}

                {(authProvider === "clerk" ? isSignedIn : !!localUser) &&
                  systemMenuItems.length > 0 && (
                    <>
                      <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        System
                      </div>
                      {renderMobileMenuItems(systemMenuItems)}
                    </>
                  )}

                {/* Auth Buttons Mobile */}
                {showAuth &&
                  !(authProvider === "clerk" ? isSignedIn : !!localUser) && (
                    <div className="mt-4 flex flex-col gap-3">
                      <Button
                        fullWidth
                        variant="bordered"
                        onPress={() => {
                          router.push("/auth/login");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Login
                      </Button>
                      {/* <Button
                      fullWidth
                      color="primary"
                      onPress={() => {
                        router.push("/auth/signup");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button> */}
                    </div>
                  )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
