// Admin CMS interface - list view (lightweight)
export interface PodcastShowAdmin {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  episodeCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

// Admin CMS interface - detail view (full)
export interface PodcastShowDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  status: "draft" | "published" | "archived";
  episodeCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
}

// Admin CMS episode - list view
export interface PodcastEpisodeAdmin {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  seasonNumber: number | null;
  episodeNumber: number | null;
  duration: number | null;
  playCount: number;
  likeCount: number;
  publishedAt: string | null;
  createdAt: string;
}

// Admin CMS episode - detail view
export interface PodcastEpisodeDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audioUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  episodeNumber: number | null;
  seasonNumber: number | null;
  status: "draft" | "published" | "archived";
  playCount: number;
  likeCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  podcastId: string;
  podcast?: {
    id: string;
    title: string;
    slug: string;
  };
}

// Comment data (threaded)
export interface PodcastCommentData {
  id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  parentId: string | null;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  replies: PodcastCommentData[];
}

// Comment for admin moderation list
export interface PodcastCommentAdmin {
  id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  episode: {
    id: string;
    title: string;
  };
  author: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

// Form payloads
export interface CreatePodcastShowData {
  title: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  authorId?: string;
  status?: "draft" | "published" | "archived";
  publishedAt?: string;
}

export interface CreatePodcastEpisodeData {
  title: string;
  slug?: string;
  description?: string;
  audioUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  episodeNumber?: number;
  seasonNumber?: number;
  status?: "draft" | "published" | "archived";
  publishedAt?: string;
}
