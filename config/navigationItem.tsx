import { Icon } from "@iconify/react";
import { type ReactNode } from "react";
import { NAV_URL } from "@/constants/url";

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
    href: NAV_URL.PUBLIC.HOME,
    icon: <Icon icon="lucide:home" className="w-4 h-4" />,
    description: "Home page",
  },
  {
    key: "about",
    label: "About",
    href: NAV_URL.PUBLIC.ABOUT,
    icon: <Icon icon="lucide:info" className="w-4 h-4" />,
    description: "About Fortuna Center",
  },
  {
    key: "broadcast-live",
    label: "Broadcast Live",
    href: NAV_URL.PUBLIC.BROADCAST_LIVE,
    icon: <Icon icon="lucide:radio" className="w-4 h-4" />,
    description: "Watch live broadcast",
    children: [
      {
        key: "audio",
        label: "Audio",
        href: NAV_URL.PUBLIC.BROADCAST_LIVE,
        icon: <Icon icon="lucide:headphones" className="w-4 h-4" />,
        description: "Audio broadcasts",
        children: [
          {
            key: "podcast-list",
            label: "Podcast List",
            href: NAV_URL.PUBLIC.PODCAST_LIST,
            icon: <Icon icon="lucide:mic" className="w-4 h-4" />,
            description: "Browse podcasts",
          },
          {
            key: "live-broadcast-audio",
            label: "Live Broadcast",
            href: NAV_URL.PUBLIC.BROADCAST_LIVE,
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
        href: NAV_URL.PUBLIC.VIDEO_GALLERY.VIDEOS,
        icon: <Icon icon="logos:youtube-icon" className="w-4 h-4" />,
        description: "Past YouTube broadcasts",
        children: [
          {
            key: "all-videos",
            label: "All Videos",
            href: NAV_URL.PUBLIC.VIDEO_GALLERY.VIDEOS,
            icon: <Icon icon="lucide:grid" className="w-4 h-4" />,
            description: "All uploaded videos",
          },
          {
            key: "playlists",
            label: "Playlists",
            href: NAV_URL.PUBLIC.VIDEO_GALLERY.PLAYLISTS,
            icon: <Icon icon="lucide:list-video" className="w-4 h-4" />,
            description: "Video playlists",
          },
          {
            key: "live-broadcasts",
            label: "Live / Past Broadcasts",
            href: NAV_URL.PUBLIC.VIDEO_GALLERY.LIVE,
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
    href: NAV_URL.PUBLIC.BLOG,
    icon: <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4" />,
    description: "Read student articles and insights",
  },
  {
    key: "our-programs",
    label: "Our Programs",
    href: NAV_URL.PUBLIC.OUR_PROGRAMS,
    icon: <Icon icon="lucide:book" className="w-4 h-4" />,
    description: "Our programs",
    children: [
      {
        key: "broadcast",
        label: "Broadcast Video / Audio",
        href: NAV_URL.PUBLIC.PROGRAMS.BROADCAST,
        icon: (
          <Icon icon="solar:microphone-3-bold-duotone" className="w-4 h-4" />
        ),
        description: "Live broadcast training",
      },
      {
        key: "lms",
        label: "LMS",
        href: NAV_URL.PUBLIC.PROGRAMS.LMS,
        icon: <Icon icon="lucide:graduation-cap" className="w-5 h-5" />,
        description: "English learning management system",
        children: [
          {
            key: "lms-overview",
            label: "Overview",
            href: NAV_URL.PUBLIC.PROGRAMS.LMS_OVERVIEW,
            icon: <Icon icon="lucide:layout-dashboard" className="w-4 h-4" />,
            description: "Ringkasan platform LMS",
          },
          {
            key: "lms-features",
            label: "Fitur",
            href: NAV_URL.PUBLIC.PROGRAMS.LMS_FEATURES,
            icon: <Icon icon="lucide:layers" className="w-4 h-4" />,
            description: "Keunggulan utama LMS",
          },
          {
            key: "lms-benefits",
            label: "Benefit",
            href: NAV_URL.PUBLIC.PROGRAMS.LMS_BENEFITS,
            icon: <Icon icon="lucide:award" className="w-4 h-4" />,
            description: "Manfaat belajar",
          },
        ],
      },
      {
        key: "article",
        label: "Article",
        href: NAV_URL.PUBLIC.PROGRAMS.ARTICLE,
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
    href: NAV_URL.SYSTEM.DASHBOARD,
    icon: <Icon icon="lucide:home" className="w-4 h-4" />,
    description: "Go to dashboard",
  },
  {
    key: "my-posts",
    label: "My Posts",
    href: NAV_URL.SYSTEM.MY_POSTS,
    icon: <Icon icon="lucide:pen-square" className="w-4 h-4" />,
    description: "Manage your posts",
  },
  {
    key: "drafts",
    label: "Drafts",
    href: NAV_URL.SYSTEM.DRAFTS,
    icon: <Icon icon="lucide:book-open" className="w-4 h-4" />,
    description: "View your drafts",
  },
  {
    key: "profile",
    label: "Profile",
    href: NAV_URL.SYSTEM.PROFILE,
    icon: <Icon icon="lucide:user" className="w-4 h-4" />,
    description: "View your profile",
  },
  {
    key: "settings",
    label: "Settings",
    href: NAV_URL.SYSTEM.SETTINGS,
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
    href: NAV_URL.SYSTEM.DASHBOARD,
    icon: (props) => <Icon icon="solar:home-2-bold-duotone" {...props} />,
  },
  {
    name: "Sessions",
    href: NAV_URL.ADMIN.SESSIONS,
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
    href: NAV_URL.ADMIN.BLOG_CMS.ROOT,
    icon: (props) => (
      <Icon icon="solar:document-text-bold-duotone" {...props} />
    ),
    children: [
      {
        name: "Posts",
        href: NAV_URL.ADMIN.BLOG_CMS.POSTS,
        icon: (props) => (
          <Icon icon="solar:document-text-bold-duotone" {...props} />
        ),
      },
      {
        name: "Categories",
        href: NAV_URL.ADMIN.BLOG_CMS.CATEGORIES,
        icon: (props) => (
          <Icon icon="solar:document-text-bold-duotone" {...props} />
        ),
      },
      {
        name: "Tags",
        href: NAV_URL.ADMIN.BLOG_CMS.TAGS,
        icon: (props) => <Icon icon="solar:tag-bold-duotone" {...props} />,
      },
      {
        name: "Comments",
        href: NAV_URL.ADMIN.BLOG_CMS.COMMENTS,
        icon: (props) => (
          <Icon icon="solar:chat-round-dots-bold-duotone" {...props} />
        ),
      },
    ],
  },
  {
    name: "LMS",
    href: NAV_URL.ADMIN.LMS.CLASSES,
    icon: (props) => (
      <Icon icon="solar:book-bookmark-bold-duotone" {...props} />
    ),
    children: [
      {
        name: "Students",
        href: NAV_URL.ADMIN.LMS.STUDENTS,
        icon: (props) => <Icon icon="solar:user-id-bold-duotone" {...props} />,
      },
      {
        name: "Teachers",
        href: NAV_URL.ADMIN.LMS.TEACHERS,
        icon: (props) => (
          <Icon icon="solar:user-speak-bold-duotone" {...props} />
        ),
      },
      {
        name: "Classes",
        href: NAV_URL.ADMIN.LMS.CLASSES,
        icon: (props) => (
          <Icon icon="solar:book-bookmark-bold-duotone" {...props} />
        ),
      },
      {
        name: "Teacher Classes",
        href: NAV_URL.ADMIN.LMS.TEACHER_CLASSES,
        icon: (props) => (
          <Icon icon="solar:users-group-rounded-bold-duotone" {...props} />
        ),
      },
      {
        name: "Class Enrollments",
        href: NAV_URL.ADMIN.LMS.CLASS_ENROLLMENTS,
        icon: (props) => (
          <Icon icon="solar:layers-minimalistic-bold-duotone" {...props} />
        ),
      },
      {
        name: "Class Scheduler Management",
        href: NAV_URL.ADMIN.SCHEDULER,
        icon: (props) => (
          <Icon icon="solar:calendar-date-bold-duotone" {...props} />
        ),
      },
      {
        name: "Lessons",
        href: NAV_URL.ADMIN.LMS.LESSONS,
        icon: (props) => <Icon icon="solar:book-bold-duotone" {...props} />,
      },
      {
        name: "Attendance Management",
        href: NAV_URL.ADMIN.LMS.ATTENDANCE,
        icon: (props) => (
          <Icon icon="solar:calendar-mark-bold-duotone" {...props} />
        ),
      },
      {
        name: "Assignments by Teacher",
        href: NAV_URL.ADMIN.LMS.ASSIGNMENTS_BY_TEACHER,
        icon: (props) => (
          <Icon icon="solar:layers-minimalistic-bold-duotone" {...props} />
        ),
      },
      {
        name: "Submissions by Student",
        href: NAV_URL.ADMIN.LMS.SUBMISSIONS_BY_STUDENT,
        icon: (props) => (
          <Icon icon="solar:layers-minimalistic-bold-duotone" {...props} />
        ),
      },
    ],
  },

  {
    name: "AzuraCast",
    href: NAV_URL.ADMIN.AZURACAST.ROOT,
    icon: (props) => <Icon icon="lucide:users" {...props} />,
    children: [
      {
        name: "Podcast",
        href: NAV_URL.ADMIN.AZURACAST.PODCAST,
        icon: (props) => <Icon icon="lucide:podcast" {...props} />,
      },
      {
        name: "Live Streaming",
        href: NAV_URL.ADMIN.AZURACAST.LIVE_STREAMING,
        icon: (props) => <Icon icon="lucide:audio-lines" {...props} />,
        children: [
          {
            name: "Streamer Account",
            href: NAV_URL.ADMIN.AZURACAST.STREAMER_ACCOUNT,
            icon: (props) => <Icon icon="lucide:user-circle" {...props} />,
          },
          {
            name: "Web DJ",
            href: NAV_URL.ADMIN.AZURACAST.WEB_DJ,
            icon: (props) => <Icon icon="lucide:disc" {...props} />,
          },
        ],
      },
      {
        name: "Storage Quota",
        href: NAV_URL.ADMIN.AZURACAST.STORAGE_QUOTA,
        icon: (props) => <Icon icon="lucide:memory-stick" {...props} />,
      },
      {
        name: "Statistics",
        href: NAV_URL.ADMIN.AZURACAST.STATISTICS,
        icon: (props) => <Icon icon="lucide:chart-line" {...props} />,
      },
      {
        name: "Logs",
        href: NAV_URL.ADMIN.AZURACAST.LOGS,
        icon: (props) => <Icon icon="lucide:file-clock" {...props} />,
      },
    ],
  },
  {
    name: "YouTube",
    href: NAV_URL.ADMIN.YOUTUBE.ROOT,
    icon: (props) => <Icon icon="logos:youtube-icon" {...props} />,
    children: [
      {
        name: "Statistics",
        href: NAV_URL.ADMIN.YOUTUBE.STATISTICS,
        icon: (props) => <Icon icon="solar:chart-2-bold-duotone" {...props} />,
      },
      {
        name: "Broadcasts",
        href: NAV_URL.ADMIN.YOUTUBE.BROADCASTS,
        icon: (props) => <Icon icon="lucide:radio" {...props} />,
      },
      {
        name: "All Videos",
        href: NAV_URL.ADMIN.YOUTUBE.VIDEOS,
        icon: (props) => <Icon icon="lucide:video" {...props} />,
      },
      {
        name: "Playlists",
        href: NAV_URL.ADMIN.YOUTUBE.PLAYLISTS,
        icon: (props) => <Icon icon="lucide:list-video" {...props} />,
      },
      {
        name: "API Usage",
        href: NAV_URL.ADMIN.YOUTUBE.USAGE,
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
    href: NAV_URL.ADMIN.ANALYTICS,
    icon: (props) => <Icon icon="solar:chart-2-bold-duotone" {...props} />,
  },

  {
    name: "Users",
    href: NAV_URL.ADMIN.USERS,
    icon: (props) => <Icon icon="lucide:users" {...props} />,
  },

  {
    name: "Settings",
    href: NAV_URL.SYSTEM.SETTINGS,
    icon: (props) => <Icon icon="solar:settings-bold-duotone" {...props} />,
  },
];

/**
 * Teacher sidebar navigation - used in teacher panel
 */
export const teacherSidebarNavigation: AdminNavigationItem[] = [
  {
    name: "Dashboard",
    href: NAV_URL.TEACHER.DASHBOARD,
    icon: (props) => <Icon icon="solar:home-2-bold-duotone" {...props} />,
  },
  {
    name: "My Classes",
    href: NAV_URL.TEACHER.CLASSES,
    icon: (props) => (
      <Icon icon="solar:users-group-rounded-bold-duotone" {...props} />
    ),
  },
  {
    name: "Lessons",
    href: NAV_URL.TEACHER.LESSONS,
    icon: (props) => <Icon icon="solar:book-bold-duotone" {...props} />,
  },
  {
    name: "Assignments",
    href: NAV_URL.TEACHER.ASSIGNMENTS,
    icon: (props) => (
      <Icon icon="solar:document-text-bold-duotone" {...props} />
    ),
  },
  {
    name: "Attendance",
    icon: (props) => (
      <Icon icon="solar:calendar-mark-bold-duotone" {...props} />
    ),
    children: [
      {
        name: "Mark Attendance",
        href: NAV_URL.TEACHER.ATTENDANCE,
        icon: (props) => <Icon icon="lucide:clipboard-check" {...props} />,
      },
      {
        name: "Class Attendance",
        href: NAV_URL.TEACHER.CLASS_ATTENDANCE,
        icon: (props) => <Icon icon="lucide:clipboard-list" {...props} />,
      },
    ],
  },
  {
    name: "Grades",
    href: NAV_URL.TEACHER.GRADES,
    icon: (props) => <Icon icon="solar:chart-square-bold-duotone" {...props} />,
  },
  {
    name: "My Teaching Schedule",
    href: NAV_URL.TEACHER.TEACHING_SCHEDULE,
    icon: (props) => <Icon icon="lucide:calendar" {...props} />,
  },

  {
    name: "Settings",
    href: NAV_URL.TEACHER.SETTINGS,
    icon: (props) => <Icon icon="solar:settings-bold-duotone" {...props} />,
  },
];

/**
 * Student sidebar navigation - used in student panel
 */
export const studentSidebarNavigation: AdminNavigationItem[] = [
  {
    name: "Dashboard",
    href: NAV_URL.STUDENT.DASHBOARD,
    icon: (props) => <Icon icon="solar:home-2-bold-duotone" {...props} />,
  },
  {
    name: "My Class",
    href: NAV_URL.STUDENT.MY_CLASS,
    icon: (props) => <Icon icon="solar:book-2-bold-duotone" {...props} />,
  },
  {
    name: "Materi Pelajaran",
    href: NAV_URL.STUDENT.MY_LESSONS,
    icon: (props) => <Icon icon="solar:notebook-bold-duotone" {...props} />,
  },
  {
    name: "Assignments",
    href: NAV_URL.STUDENT.MY_ASSIGNMENTS,
    icon: (props) => <Icon icon="solar:document-bold-duotone" {...props} />,
  },
  {
    name: "Grades",
    href: NAV_URL.STUDENT.GRADES,
    icon: (props) => <Icon icon="solar:chart-bold-duotone" {...props} />,
  },
  {
    name: "My Attendance",
    href: NAV_URL.STUDENT.ATTENDANCE,
    icon: (props) => (
      <Icon icon="solar:calendar-mark-bold-duotone" {...props} />
    ),
  },
  {
    name: "Schedule",
    href: NAV_URL.STUDENT.SEE_SCHEDULES,
    icon: (props) => <Icon icon="solar:calendar-bold-duotone" {...props} />,
  },
  {
    name: "My Articles",
    href: "/my-articles",
    icon: (props) => (
      <Icon icon="solar:pen-new-square-bold-duotone" {...props} />
    ),
  },
  {
    name: "Settings",
    href: NAV_URL.STUDENT.SETTINGS,
    icon: (props) => <Icon icon="solar:settings-bold-duotone" {...props} />,
  },
];

/**
 * Administrative Employee sidebar navigation
 */
export const administrativeEmployeeSidebarNavigation: AdminNavigationItem[] = [
  {
    name: "Dashboard",
    href: NAV_URL.ADMINISTRATIVE.DASHBOARD,
    icon: (props) => <Icon icon="solar:home-2-bold-duotone" {...props} />,
  },
  {
    name: "Users",
    href: NAV_URL.ADMINISTRATIVE.USERS,
    icon: (props) => <Icon icon="lucide:users" {...props} />,
  },
  {
    name: "Reports",
    href: NAV_URL.ADMINISTRATIVE.REPORTS,
    icon: (props) => (
      <Icon icon="solar:document-text-bold-duotone" {...props} />
    ),
  },
  {
    name: "Attendance",
    href: NAV_URL.ADMINISTRATIVE.ATTENDANCE,
    icon: (props) => (
      <Icon icon="solar:calendar-mark-bold-duotone" {...props} />
    ),
  },
  {
    name: "Settings",
    href: NAV_URL.ADMINISTRATIVE.SETTINGS,
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
