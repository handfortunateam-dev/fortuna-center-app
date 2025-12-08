"use client";

import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
// import { Share2, Link as LinkIcon, MessageCircle } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
// import { Share2, Link as LinkIcon, MessageCircle } from "lucide-react";
import { Icon } from "@iconify/react";

interface ShareDropdownProps {
  title: string;
  url: string;
}

export default function ShareDropdown({ title, url }: ShareDropdownProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      Toast({
        title: "Success",
        description: "Link copied to clipboard!",
        color: "success",
      });
    } catch (err) {
      Toast({
        title: "Error",
        description: "Failed to copy link",
        color: "danger",
      });
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Icon icon="lucide:share-2" className="h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Share options">
        <DropdownItem
          key="copy"
          startContent={<Icon icon="lucide:link" className="h-4 w-4" />}
          onPress={handleCopyLink}
        >
          Copy Link
        </DropdownItem>
        <DropdownItem
          key="whatsapp"
          startContent={<Icon icon="lucide:message-circle" className="h-4 w-4" />}
          onPress={() => handleShare("whatsapp")}
        >
          WhatsApp
        </DropdownItem>
        <DropdownItem
          key="facebook"
          startContent={
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          }
          onPress={() => handleShare("facebook")}
        >
          Facebook
        </DropdownItem>
        <DropdownItem
          key="twitter"
          startContent={
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          }
          onPress={() => handleShare("twitter")}
        >
          X (Twitter)
        </DropdownItem>
        <DropdownItem
          key="telegram"
          startContent={
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          }
          onPress={() => handleShare("telegram")}
        >
          Telegram
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
