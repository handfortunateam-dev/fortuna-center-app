"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface UIContextType {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  expandedMobileMenuKeys: Set<string>;
  toggleMobileMenuExpanded: (key: string) => void;
  expandMobileMenuItem: (key: string) => void;
  openDesktopMenuKey: string | null;
  setOpenDesktopMenuKey: (key: string | null) => void;
  triggerProgramsMenu: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenuKeys, setExpandedMobileMenuKeys] = useState<Set<string>>(new Set());
  const [openDesktopMenuKey, setOpenDesktopMenuKey] = useState<string | null>(null);

  const toggleMobileMenuExpanded = useCallback((key: string) => {
    setExpandedMobileMenuKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const expandMobileMenuItem = useCallback((key: string) => {
    setExpandedMobileMenuKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const triggerProgramsMenu = useCallback(() => {
    const isMobile = window.innerWidth < 1280; // xl breakpoint in Tailwind for desktop nav
    if (isMobile) {
      setIsMobileMenuOpen(true);
      expandMobileMenuItem("our-programs");
    } else {
      setOpenDesktopMenuKey("our-programs");
      // Optional: scroll to top so navbar is visible if it's not sticky
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [expandMobileMenuItem]);

  return (
    <UIContext.Provider
      value={{
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        expandedMobileMenuKeys,
        toggleMobileMenuExpanded,
        expandMobileMenuItem,
        openDesktopMenuKey,
        setOpenDesktopMenuKey,
        triggerProgramsMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
