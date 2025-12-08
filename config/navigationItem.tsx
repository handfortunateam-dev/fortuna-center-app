import { Icon } from "@iconify/react";
import { type ReactNode } from "react";

export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
  description?: string;
  children?: NavigationItem[];
}

export interface AdminNavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: AdminNavigationItem[];
}

/**
 * Public menu items - visible to all users
 */
export const publicMenuItems: NavigationItem[] = [
  {
    key: "home",
    label: "Home",
    href: "/",
    icon: <Icon icon="lucide:home" className="w-4 h-4" />,
    description: "Home page",
  },
  {
    key: "about",
    label: "About",
    href: "/about",
    icon: <Icon icon="lucide:info" className="w-4 h-4" />,
    description: "About Fortuna Center",
  },
  {
    key: "broadcast-live",
    label: "Broadcast Live",
    href: "/broadcast-live",
    icon: <Icon icon="lucide:radio" className="w-4 h-4" />,
    description: "Watch live broadcast",
    children: [
      {
        key: "audio",
        label: "Audio",
        href: "/broadcast-live",
        icon: <Icon icon="lucide:headphones" className="w-4 h-4" />,
        description: "Audio broadcasts",
        children: [
          {
            key: "podcast-list",
            label: "Podcast List",
            href: "/podcast-list",
            icon: <Icon icon="lucide:mic" className="w-4 h-4" />,
            description: "Browse podcasts",
          },
          {
            key: "live-broadcast-audio",
            label: "Live Broadcast",
            href: "/broadcast-live",
            icon: <Icon icon="lucide:radio" className="w-4 h-4" />,
            description: "Live audio broadcast",
          },
        ],
      },
      // {
      //   key: "video",
      //   label: "Video",
      //   href: "/broadcast-live#video",
      //   icon: <Icon icon="lucide:video" className="w-4 h-4" />,
      //   description: "Video broadcasts",
      // },
      {
        key: "video-gallery",
        label: "Video Gallery (YouTube)",
        // Href set to first child or parent route
        href: "/video-gallery/videos",
        icon: <Icon icon="logos:youtube-icon" className="w-4 h-4" />,
        description: "Past YouTube broadcasts",
        children: [
          {
            key: "all-videos",
            label: "All Videos",
            href: "/video-gallery/videos",
            icon: <Icon icon="lucide:grid" className="w-4 h-4" />,
            description: "All uploaded videos",
          },
          {
            key: "playlists",
            label: "Playlists",
            href: "/video-gallery/playlists",
            icon: <Icon icon="lucide:list-video" className="w-4 h-4" />,
            description: "Video playlists",
          },
          {
            key: "live-broadcasts",
            label: "Live / Past Broadcasts",
            href: "/video-gallery/live",
            icon: <Icon icon="lucide:radio" className="w-4 h-4" />,
            description: "Archived live streams",
          },
        ],
      },
    ],
  },
  {
    key: "blog",
    label: "Blog",
    href: "/blog",
    icon: <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4" />,
    description: "Read student articles and insights",
  },
  {
    key: "our-programs",
    label: "Our Programs",
    href: "/our-programs",
    icon: <Icon icon="lucide:book" className="w-4 h-4" />,
    description: "Our programs",
    children: [
      {
        key: "broadcast",
        label: "Broadcast Video / Audio",
        href: "/programs/broadcast",
        icon: (
          <Icon icon="solar:microphone-3-bold-duotone" className="w-4 h-4" />
        ),
        description: "Live broadcast training",
      },
      {
        key: "lms",
        label: "LMS",
        href: "/programs/lms",
        icon: (
          <Icon icon="solar:book-bookmark-bold-duotone" className="w-4 h-4" />
        ),
        description: "English learning management system",
        children: [
          {
            key: "lms-overview",
            label: "Overview",
            href: "/programs/lms#overview",
            icon: (
              <Icon
                icon="solar:bookmark-square-bold-duotone"
                className="w-4 h-4"
              />
            ),
            description: "Ringkasan platform LMS",
          },
          {
            key: "lms-features",
            label: "Fitur",
            href: "/programs/lms#features",
            icon: (
              <Icon icon="solar:widgets-bold-duotone" className="w-4 h-4" />
            ),
            description: "Keunggulan utama LMS",
          },
          {
            key: "lms-benefits",
            label: "Benefit",
            href: "/programs/lms#benefits",
            icon: (
              <Icon
                icon="solar:medal-ribbons-bold-duotone"
                className="w-4 h-4"
              />
            ),
            description: "Manfaat belajar",
          },
        ],
      },
      {
        key: "article",
        label: "Article",
        href: "/programs/article",
        icon: <Icon icon="solar:book-bold-duotone" className="w-4 h-4" />,
        description: "Article",
      },
    ],
  },
];

/**
 * System/Private menu items - visible only to authenticated users
 */
export const systemMenuItems: NavigationItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <Icon icon="lucide:home" className="w-4 h-4" />,
    description: "Go to dashboard",
  },
  {
    key: "my-posts",
    label: "My Posts",
    href: "/my-posts",
    icon: <Icon icon="lucide:pen-square" className="w-4 h-4" />,
    description: "Manage your posts",
  },
  {
    key: "drafts",
    label: "Drafts",
    href: "/drafts",
    icon: <Icon icon="lucide:book-open" className="w-4 h-4" />,
    description: "View your drafts",
  },
  {
    key: "profile",
    label: "Profile",
    href: "/profile",
    icon: <Icon icon="lucide:user" className="w-4 h-4" />,
    description: "View your profile",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    icon: <Icon icon="lucide:settings" className="w-4 h-4" />,
    description: "Account settings",
  },
];

/**
 * All navigation items combined
 */
export const allMenuItems: NavigationItem[] = [
  ...publicMenuItems,
  ...systemMenuItems,
];

/**
 * Get menu item by key
 */
export const getMenuItemByKey = (key: string): NavigationItem | undefined => {
  return allMenuItems.find((item) => item.key === key);
};

/**
 * Get public menu items
 */
export const getPublicMenuItems = (): NavigationItem[] => {
  return publicMenuItems;
};

/**
 * Get system/private menu items
 */
export const getSystemMenuItems = (): NavigationItem[] => {
  return systemMenuItems;
};

/**
 * Admin/System sidebar navigation - used in admin panel
 */
export const adminSidebarNavigation: AdminNavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (props) => <Icon icon="solar:home-2-bold-duotone" {...props} />,
  },
  {
    name: "Sessions",
    href: "/sessions",
    icon: (props) => (
      <Icon icon="solar:video-library-bold-duotone" {...props} />
    ),
  },

  // {
  //   name: "Broadcast CMS",
  //   href: "/broadcast-cms",
  //   icon: (props) => (
  //     <Icon icon="solar:document-text-bold-duotone" {...props} />
  //   ),
  //   children: [
  //     {
  //       name: "Broadcast",
  //       href: "/broadcast-cms/broadcast",
  //       icon: (props) => (
  //         <Icon icon="solar:document-text-bold-duotone" {...props} />
  //       ),
  //     },
  //     {
  //       name: "Broadcast Categories",
  //       href: "/broadcast-cms/broadcast-categories",
  //       icon: (props) => (
  //         <Icon icon="solar:document-text-bold-duotone" {...props} />
  //       ),
  //     },
  //   ],
  // },

  {
    name: "Blog CMS",
    href: "/blog-cms",
    icon: (props) => (
      <Icon icon="solar:document-text-bold-duotone" {...props} />
    ),
    children: [
      {
        name: "Posts",
        href: "/blog-cms/posts",
        icon: (props) => (
          <Icon icon="solar:document-text-bold-duotone" {...props} />
        ),
      },
      {
        name: "Categories",
        href: "/blog-cms/categories",
        icon: (props) => (
          <Icon icon="solar:document-text-bold-duotone" {...props} />
        ),
      },
    ],
  },
  {
    name: "LMS",
    href: "/classes",
    icon: (props) => (
      <Icon icon="solar:book-bookmark-bold-duotone" {...props} />
    ),
    children: [
      {
        name: "Classes",
        href: "/classes",
        icon: (props) => (
          <Icon icon="solar:book-bookmark-bold-duotone" {...props} />
        ),
      },
      {
        name: "Teacher Classes",
        href: "/teacher-classes",
        icon: (props) => (
          <Icon icon="solar:users-group-rounded-bold-duotone" {...props} />
        ),
      },
      {
        name: "Class Enrollments",
        href: "/class-enrollments",
        icon: (props) => (
          <Icon icon="solar:layers-minimalistic-bold-duotone" {...props} />
        ),
      },
    ],
  },

  {
    name: "AzuraCast",
    href: "/azuracast",
    icon: (props) => <Icon icon="lucide:users" {...props} />,
    children: [
      {
        name: "Podcast",
        href: "/azuracast/podcast",
        icon: (props) => <Icon icon="lucide:podcast" {...props} />,
      },
      {
        name: "Live Streaming",
        href: "/azuracast/live-streaming",
        icon: (props) => <Icon icon="lucide:audio-lines" {...props} />,
        children: [
          {
            name: "Streamer Account",
            href: "/azuracast/live-streaming/streamer-account",
            icon: (props) => <Icon icon="lucide:user-circle" {...props} />,
          },
          {
            name: "Web DJ",
            href: "/azuracast/live-streaming/web-dj",
            icon: (props) => <Icon icon="lucide:disc" {...props} />,
          },
        ],
      },
      {
        name: "Storage Quota",
        href: "/azuracast/storage-quota",
        icon: (props) => <Icon icon="lucide:memory-stick" {...props} />,
      },
      {
        name: "Statistics",
        href: "/azuracast/statistics",
        icon: (props) => <Icon icon="lucide:chart-line" {...props} />,
      },
      {
        name: "Logs",
        href: "/azuracast/logs",
        icon: (props) => <Icon icon="lucide:file-clock" {...props} />,
      },
    ],
  },
  {
    name: "YouTube",
    href: "/youtube-integration",
    icon: (props) => <Icon icon="logos:youtube-icon" {...props} />,
    children: [
      {
        name: "Statistics",
        href: "/youtube-integration/statistics",
        icon: (props) => <Icon icon="solar:chart-2-bold-duotone" {...props} />,
      },
      {
        name: "Broadcasts",
        href: "/youtube-integration/broadcasts",
        icon: (props) => <Icon icon="lucide:radio" {...props} />,
      },
      {
        name: "All Videos",
        href: "/youtube-integration/videos",
        icon: (props) => <Icon icon="lucide:video" {...props} />,
      },
      {
        name: "Playlists",
        href: "/youtube-integration/playlists",
        icon: (props) => <Icon icon="lucide:list-video" {...props} />,
      },
      {
        name: "API Usage",
        href: "/youtube-integration/usage",
        icon: (props) => (
          <Icon icon="solar:pie-chart-2-bold-duotone" {...props} />
        ),
      },
    ],
  },
  //   { name: "Comments", href: "/comments", icon: (props) => <Icon icon="lucide:messages-square" {...props} /> },
  //   { name: "Types", href: "/types", icon: (props) => <Icon icon="lucide:type" {...props} /> },
  {
    name: "Analytics",
    href: "/analytics",
    icon: (props) => <Icon icon="solar:chart-2-bold-duotone" {...props} />,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (props) => <Icon icon="solar:settings-bold-duotone" {...props} />,
  },
];

/**
 * Teacher sidebar navigation - used in teacher panel
 */
export const teacherSidebarNavigation: AdminNavigationItem[] = [
  {
    name: "Dashboard",
    href: "/teacher/dashboard",
    icon: (props) => <Icon icon="solar:home-2-bold-duotone" {...props} />,
  },
  {
    name: "My Classes",
    href: "/teacher/classes",
    icon: (props) => (
      <Icon icon="solar:users-group-rounded-bold-duotone" {...props} />
    ),
  },
  {
    name: "Lessons",
    href: "/teacher/lessons",
    icon: (props) => <Icon icon="solar:book-bold-duotone" {...props} />,
  },
  {
    name: "Assignments",
    href: "/teacher/assignments",
    icon: (props) => (
      <Icon icon="solar:document-text-bold-duotone" {...props} />
    ),
  },
  {
    name: "Grades",
    href: "/teacher/grades",
    icon: (props) => <Icon icon="solar:chart-square-bold-duotone" {...props} />,
  },
  {
    name: "Settings",
    href: "/teacher/settings",
    icon: (props) => <Icon icon="solar:settings-bold-duotone" {...props} />,
  },
];

/**
 * Student sidebar navigation - used in student panel
 */
export const studentSidebarNavigation: AdminNavigationItem[] = [
  {
    name: "Dashboard",
    href: "/student/dashboard",
    icon: (props) => <Icon icon="solar:home-2-bold-duotone" {...props} />,
  },
  {
    name: "My Courses",
    href: "/student/courses",
    icon: (props) => <Icon icon="solar:book-2-bold-duotone" {...props} />,
  },
  {
    name: "Assignments",
    href: "/student/assignments",
    icon: (props) => <Icon icon="solar:document-bold-duotone" {...props} />,
  },
  {
    name: "Grades",
    href: "/student/grades",
    icon: (props) => <Icon icon="solar:chart-bold-duotone" {...props} />,
  },
  {
    name: "Schedule",
    href: "/student/schedule",
    icon: (props) => <Icon icon="solar:calendar-bold-duotone" {...props} />,
  },
  {
    name: "Settings",
    href: "/student/settings",
    icon: (props) => <Icon icon="solar:settings-bold-duotone" {...props} />,
  },
];

/**
 * Administrative Employee sidebar navigation
 */
export const administrativeEmployeeSidebarNavigation: AdminNavigationItem[] = [
  {
    name: "Dashboard",
    href: "/administrative/dashboard",
    icon: (props) => <Icon icon="solar:home-2-bold-duotone" {...props} />,
  },
  {
    name: "Users",
    href: "/administrative/users",
    icon: (props) => <Icon icon="lucide:users" {...props} />,
  },
  {
    name: "Reports",
    href: "/administrative/reports",
    icon: (props) => (
      <Icon icon="solar:document-text-bold-duotone" {...props} />
    ),
  },
  {
    name: "Attendance",
    href: "/administrative/attendance",
    icon: (props) => (
      <Icon icon="solar:calendar-mark-bold-duotone" {...props} />
    ),
  },
  {
    name: "Settings",
    href: "/administrative/settings",
    icon: (props) => <Icon icon="solar:settings-bold-duotone" {...props} />,
  },
];

/**
 * Get navigation items by role
 */
export const getNavigationByRole = (role: string): AdminNavigationItem[] => {
  switch (role) {
    case "ADMIN":
      return adminSidebarNavigation;
    case "TEACHER":
      return teacherSidebarNavigation;
    case "STUDENT":
      return studentSidebarNavigation;
    case "ADMINISTRATIVE_EMPLOYEE":
      return administrativeEmployeeSidebarNavigation;
    default:
      return [];
  }
};

/**
 * Get admin sidebar navigation items
 */
export const getAdminSidebarNavigation = (): AdminNavigationItem[] => {
  return adminSidebarNavigation;
};
