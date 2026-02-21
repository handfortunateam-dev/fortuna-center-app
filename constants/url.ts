
export const API_URL = {
    USERS: {
        BASE: "/users",
    }
};

export const NAV_URL = {
    PUBLIC: {
        HOME: "/",
        ABOUT: "/about",
        BROADCAST_LIVE: "/broadcast-live",
        PODCAST_LIST: "/podcast-list",
        VIDEO_GALLERY: {
            VIDEOS: "/video-gallery/videos",
            PLAYLISTS: "/video-gallery/playlists",
            LIVE: "/video-gallery/live",
        },
        BLOG: "/blog",
        OUR_PROGRAMS: "/our-programs",
        PROGRAMS: {
            BROADCAST: "/programs/broadcast",
            LMS: "/programs/lms",
            LMS_OVERVIEW: "/programs/lms#overview",
            LMS_FEATURES: "/programs/lms#features",
            LMS_BENEFITS: "/programs/lms#benefits",
            ARTICLE: "/programs/article",
        }
    },
    SYSTEM: {
        DASHBOARD: "/dashboard",
        MY_POSTS: "/my-posts",
        DRAFTS: "/drafts",
        PROFILE: "/profile",
        SETTINGS: "/settings",
    },
    ADMIN: {
        SESSIONS: "/sessions",
        BLOG_CMS: {
            ROOT: "/blog-cms",
            POSTS: "/blog-cms/posts",
            CATEGORIES: "/blog-cms/categories",
            TAGS: "/blog-cms/tags",
            COMMENTS: "/blog-cms/comments",
        },
        LMS: {
            CLASSES: "/classes",
            TEACHER_CLASSES: "/teacher-classes",
            CLASS_ENROLLMENTS: "/class-enrollments",
            TEACHERS: "/teachers",
            LESSONS: "/lessons",
            ATTENDANCE: "/attendance-management",
            ASSIGNMENTS_BY_TEACHER: "/assignments-by-teacher",
            SUBMISSIONS_BY_STUDENT: "/submissions-by-student",
            STUDENTS: "/students",
            GRADES: "/grades"
        },
        AZURACAST: {
            ROOT: "/azuracast",
            PODCAST: "/azuracast/podcast",
            LIVE_STREAMING: "/azuracast/live-streaming",
            STREAMER_ACCOUNT: "/azuracast/live-streaming/streamer-account",
            WEB_DJ: "/azuracast/live-streaming/web-dj",
            STORAGE_QUOTA: "/azuracast/storage-quota",
            STATISTICS: "/azuracast/statistics",
            LOGS: "/azuracast/logs"
        },
        PODCAST_CMS: {
            ROOT: "/podcast-cms",
            SHOWS: "/podcast-cms/shows",
            COMMENTS: "/podcast-cms/comments",
        },
        YOUTUBE: {
            ROOT: "/youtube-integration",
            STATISTICS: "/youtube-integration/statistics",
            BROADCASTS: "/youtube-integration/broadcasts",
            VIDEOS: "/youtube-integration/videos",
            PLAYLISTS: "/youtube-integration/playlists",
            USAGE: "/youtube-integration/usage"
        },
        SCHEDULER: "/class-scheduler-management",
        ANALYTICS: {
            ROOT: "/analytics",
            USERS: "/analytics/users",
            STUDENT_PERFORMANCE: "/analytics/student-performance",
            FINANCIAL: "/analytics/financial",
        },
        USERS: "/users",
        VULTR: {
            ROOT: "/vultr-billing",
            HISTORY: "/vultr-billing/history",
            INVOICES: "/vultr-billing/invoices",
            PENDING: "/vultr-billing/pending-charges",
        },
        PAYMENT_COURSE_HISTORY: "/payment-course-history",
    },
    TEACHER: {
        DASHBOARD: "/dashboard",
        CLASSES: "/classes-list",
        LESSONS: "/lessons-list", // Assumed or to be created, keeping consistent naming style
        ASSIGNMENTS: "/assignments-for-classes",
        ATTENDANCE: "/attendance",
        CLASS_ATTENDANCE: "/classes-attendance",
        GRADES: "/grades-overview", // Assumed
        TEACHING_SCHEDULE: "/teaching-schedule",
        SETTINGS: "/teacher-settings", // Assumed
    },
    STUDENT: {
        DASHBOARD: "/dashboard",
        MY_CLASS: "/my-class",
        MY_LESSONS: "/my-lessons",
        MY_ASSIGNMENTS: "/my-assignments",
        GRADES: "/my-grades",
        ATTENDANCE: "/my-attendance",
        SEE_SCHEDULES: "/see-schedules",
        SETTINGS: "/student-settings",
    },
    ADMINISTRATIVE: {
        DASHBOARD: "/administrative/dashboard",
        USERS: "/administrative/users",
        REPORTS: "/administrative/reports",
        ATTENDANCE: "/administrative/attendance",
        SETTINGS: "/administrative/settings",
    }
};