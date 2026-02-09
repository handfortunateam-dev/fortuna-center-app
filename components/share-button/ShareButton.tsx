"use client";

import { useState, useEffect } from "react";
import {
  Button,
  ButtonProps,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/toast";

export interface ShareButtonProps extends ButtonProps {
  url: string;
  title: string;
  text?: string;
  useNativeShare?: boolean;
}

export function ShareButton({
  url,
  title,
  text,
  useNativeShare = true,
  children,
  ...props
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // We check for 'window' to be SSR-safe
  const isRelative = typeof window !== "undefined" && url.startsWith("/");
  const resolvedUrl = isRelative ? `${window.location.origin}${url}` : url;

  const encodedUrl = encodeURIComponent(resolvedUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text || "");

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A${encodedUrl}`,
  };

  const handleShare = async (platform?: keyof typeof shareLinks) => {
    // Try native share if requested and available
    if (useNativeShare && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: resolvedUrl,
        });
        Toast({
          title: "Shared successfully",
          color: "success",
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to dropdown if desired or just log
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
        // If it was AbortError (user cancelled), we stop here.
        // If it was another error, we could fall back to manual menu, but usually native share is reliable if present.
        // However, since we are inside the handler, if native share fails/cancels, we might want to show the menu?
        // Actually, if native share is triggered, we probably don't want to open the dropdown immediately after unless it failed due to support.
        // The check `navigator.share` ensures support.
        return;
      }
    }

    if (platform) {
      window.open(shareLinks[platform], "_blank", "noopener,noreferrer");
      setIsOpen(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      Toast({
        title: "Link copied",
        color: "success",
      });
      setIsOpen(false);
    } catch (err) {
      Toast({
        title: "Failed to copy",
        color: "danger",
      });
    }
  };

  // If using native share and it's available, render a simple button
  const canUseNativeShare =
    useNativeShare && typeof navigator !== "undefined" && navigator.share;

  if (canUseNativeShare) {
    return (
      <Button onPress={() => handleShare()} {...props}>
        {children || (
          <>
            <Icon icon="lucide:share-2" className="w-4 h-4" />
            <span>Share</span>
          </>
        )}
      </Button>
    );
  }

  // Fallback to Dropdown
  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <DropdownTrigger>
        <Button {...props}>
          {children || (
            <>
              <Icon icon="lucide:share-2" className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Share options" variant="flat">
        <DropdownItem
          key="copy"
          startContent={<Icon icon="lucide:link" className="text-lg" />}
          onPress={handleCopyLink}
        >
          Copy Link
        </DropdownItem>
        <DropdownItem
          key="whatsapp"
          startContent={<Icon icon="logos:whatsapp-icon" className="text-lg" />}
          onPress={() => handleShare("whatsapp")}
        >
          WhatsApp
        </DropdownItem>
        <DropdownItem
          key="facebook"
          startContent={<Icon icon="logos:facebook" className="text-lg" />}
          onPress={() => handleShare("facebook")}
        >
          Facebook
        </DropdownItem>
        <DropdownItem
          key="twitter"
          startContent={<Icon icon="logos:twitter" className="text-lg" />}
          onPress={() => handleShare("twitter")}
        >
          X (Twitter)
        </DropdownItem>
        <DropdownItem
          key="linkedin"
          startContent={<Icon icon="logos:linkedin-icon" className="text-lg" />}
          onPress={() => handleShare("linkedin")}
        >
          LinkedIn
        </DropdownItem>
        <DropdownItem
          key="telegram"
          startContent={<Icon icon="logos:telegram" className="text-lg" />}
          onPress={() => handleShare("telegram")}
        >
          Telegram
        </DropdownItem>
        <DropdownItem
          key="email"
          startContent={<Icon icon="lucide:mail" className="text-lg" />}
          onPress={() => handleShare("email")}
        >
          Email
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
