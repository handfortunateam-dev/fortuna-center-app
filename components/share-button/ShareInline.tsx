"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareItem {
  key: string;
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  hoverColor: string;
  hoverBg: string;
}

interface ShareInlineProps {
  url: string;
  title: string;
  /** "horizontal" expands icons to the right, "vertical" expands downward */
  direction?: "horizontal" | "vertical";
  /** Size of each icon button */
  size?: "sm" | "md";
  className?: string;
}

export function ShareInline({
  url,
  title,
  direction = "horizontal",
  size = "sm",
  className = "",
}: ShareInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve URL on client
  const resolvedUrl =
    typeof window !== "undefined" && url.startsWith("/")
      ? `${window.location.origin}${url}`
      : url;

  const encodedUrl = encodeURIComponent(resolvedUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
    } catch {}
    setIsOpen(false);
  };

  const items: ShareItem[] = [
    {
      key: "whatsapp",
      icon: "logos:whatsapp-icon",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      hoverColor: "hover:text-green-500",
      hoverBg: "hover:bg-green-50",
    },
    {
      key: "twitter",
      icon: "ri:twitter-x-fill",
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      hoverColor: "hover:text-gray-900 dark:hover:text-white",
      hoverBg: "hover:bg-gray-100 dark:hover:bg-gray-800",
    },
    {
      key: "facebook",
      icon: "logos:facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverColor: "hover:text-blue-600",
      hoverBg: "hover:bg-blue-50",
    },
    {
      key: "telegram",
      icon: "logos:telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      hoverColor: "hover:text-blue-400",
      hoverBg: "hover:bg-blue-50",
    },
    {
      key: "copy",
      icon: "solar:link-linear",
      label: "Copy link",
      onClick: handleCopyLink,
      hoverColor: "hover:text-foreground",
      hoverBg: "hover:bg-muted",
    },
  ];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const btnSize = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "sm" ? "text-[15px]" : "text-base";
  const isHorizontal = direction === "horizontal";

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
    >
      {/* Share trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${btnSize} rounded-full flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-primary hover:bg-muted"
        }`}
        title="Share"
      >
        <Icon icon="solar:share-linear" className={iconSize} />
      </button>

      {/* Expanding social icons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              ...(isHorizontal ? { width: 0 } : { height: 0 }),
            }}
            animate={{
              opacity: 1,
              scale: 1,
              ...(isHorizontal ? { width: "auto" } : { height: "auto" }),
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              ...(isHorizontal ? { width: 0 } : { height: 0 }),
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`overflow-hidden ${
              isHorizontal
                ? "flex items-center ml-1 gap-0.5"
                : "absolute left-1/2 -translate-x-1/2 top-full mt-2 flex flex-col items-center gap-0.5 bg-background border border-border/50 rounded-xl shadow-lg p-1.5 z-50"
            }`}
          >
            {items.map((item, i) => {
              const inner = (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.15 }}
                  key={item.key}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btnSize} rounded-full flex items-center justify-center text-muted-foreground ${item.hoverColor} ${item.hoverBg} transition-all duration-150`}
                      title={item.label}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon icon={item.icon} className={iconSize} />
                    </a>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className={`${btnSize} rounded-full flex items-center justify-center text-muted-foreground ${item.hoverColor} ${item.hoverBg} transition-all duration-150`}
                      title={item.label}
                    >
                      <Icon icon={item.icon} className={iconSize} />
                    </button>
                  )}
                </motion.div>
              );
              return inner;
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
