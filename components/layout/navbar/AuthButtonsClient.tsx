"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
// import { LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
interface AuthButtonsClientProps {
  showDashboard: boolean;
}

export default function AuthButtonsClient({
  showDashboard,
}: AuthButtonsClientProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Show Dashboard button for logged in users (non-VISITOR)
  if (showDashboard) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 h-10 font-medium"
        onClick={() => router.push("/dashboard")}
        startContent={<Icon icon="lucide:layout-dashboard" className="w-4 h-4" />}
      >
        Dashboard
      </Button>
    );
  }

  // Show Login/Sign Up buttons for non-logged in users
  return (
    <div
      className="hidden md:flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Login Button - Always visible */}
      <Button
        variant="bordered"
        className="text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 h-10 font-medium"
        onClick={() => router.push("/auth/login")}
        startContent={<Icon icon="lucide:log-in" className="w-4 h-4" />}
      >
        Login
      </Button>

      {/* Sign Up Button - Slides in from left on hover */}
      <Button
        variant="bordered"
        className={`text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 h-10 font-medium transition-all duration-300 ${
          isHovered
            ? "opacity-100 w-auto px-4"
            : "opacity-0 w-0 px-0 overflow-hidden border-0"
        }`}
        onClick={() => router.push("/auth/signup")}
        startContent={isHovered ? <Icon icon="lucide:user-plus" className="w-4 h-4" /> : null}
      >
        {isHovered && "Sign Up"}
      </Button>
    </div>
  );
}
