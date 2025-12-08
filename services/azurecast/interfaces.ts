// services/azuracast/types.ts

export interface NowPlayingSong {
  title: string;
  artist: string;
  album?: string;
  art?: string | null;
  custom_fields?: Record<string, string>;
}

export interface NowPlayingEntry {
  played_at: number;
  duration: number;
  song: NowPlayingSong;
}

export interface ListenerStats {
  total: number;
  unique: number;
  current: number;
}

export interface NowPlayingResponse {
  station: Station;
  listeners: ListenerStats;
  live: {
    is_live: boolean;
    streamer_name: string;
    broadcast_start: number | null;
  };
  now_playing: {
    song: NowPlayingSong;
    played_at: number;
    duration: number;
  };
  song_history: NowPlayingEntry[];
}

export interface Station {
  id: number;
  name: string;
  shortcode: string;
  description?: string;
  url?: string;
  listen_url: string;
  public_player_url: string;
  playlist_pls_url: string;
  playlist_m3u_url: string;
  is_public: boolean;
}

export interface StationMount {
  id: number;
  name: string;
  url: string;
  bitrate: number;
  format: string;
  is_default: boolean;
  listeners: ListenerStats;
}

export interface Podcast {
  id: string;
  storage_location_id: number;
  source: string;
  playlist_id: number;
  playlist_auto_publish: boolean;
  title: string;
  link: string;
  description: string;
  description_short: string;
  explicit: boolean;
  is_enabled: boolean;
  branding_config: {
    enable_op3_prefix: boolean;
    public_custom_html: string | null;
  };
  language: string;
  language_name: string;
  author: string;
  email: string;
  has_custom_art: boolean;
  art: string;
  art_updated_at: number;
  guid: string;
  is_published: boolean;
  episodes: number;
  categories: {
    category: string;
    text: string;
    title: string;
    subtitle: string;
  }[];
  links: {
    self: string;
    episodes: string;
    public_episodes: string;
    public_feed: string;
  };
}

export interface PodcastEpisode {
  id: string;
  title: string;
  link: string | null;
  description: string;
  description_short: string;
  explicit: boolean;
  season_number: number | null;
  episode_number: number | null;
  created_at: number;
  publish_at: number;
  is_published: boolean;
  has_media: boolean;
  playlist_media_id: string;
  playlist_media: {
    id: string;
    art: string;
    custom_fields: unknown[];
    text: string;
    artist: string;
    title: string;
    album: string;
    genre: string;
    isrc: string;
    lyrics: string;
  };
  media: unknown;
  has_custom_art: boolean;
  art: string;
  art_updated_at: number;
  links: {
    self: string;
    public: string;
    download: string;
  };
  audio_url?: string; // Keep for compatibility if needed, or remove if we use links.download
}

export interface PodcastEpisodesResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
  rows: PodcastEpisode[];
}

export interface HlsInfo {
  enabled: boolean;
  is_default: boolean;
  url: string;
  listeners: number;
}

export interface ScheduleItem {
  id: number;
  start_time: number;
  end_time: number;
  start_date: string;
  end_date: string;
  days: number[];
  loop_once: boolean;
}

export interface Streamer {
  id: number;
  streamer_username: string;
  streamer_password?: string; // Optional in response
  display_name: string;
  comments: string | null;
  is_active: boolean;
  enforce_schedule: boolean;
  reactivate_at: number | null;
  art_updated_at: number;
  schedule_items: ScheduleItem[];
  broadcasts: unknown[];
  links: {
    self: string;
    broadcasts: string;
    broadcasts_batch: string;
    art: string;
  };
  has_custom_art: boolean;
  art: string;
}

export interface StreamersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
  rows: Streamer[];
}

export interface CreateStreamerPayload {
  streamer_username: string;
  streamer_password: string;
  display_name: string;
  comments?: string;
  is_active?: boolean;
  enforce_schedule?: boolean;
  schedule_items?: Partial<ScheduleItem>[];
  artwork_file?: string | null;
}

export interface UpdateStreamerPayload {
  streamer_username?: string;
  streamer_password?: string;
  display_name?: string;
  comments?: string;
  is_active?: boolean;
  enforce_schedule?: boolean;
  schedule_items?: Partial<ScheduleItem>[];
  artwork_file?: string | null;
}

export interface VueStreamersResponse {
  recordStreams: boolean;
  connectionServerUrl: string;
  connectionStreamPort: number;
  connectionIp: string;
  connectionDjMountPoint: string;
}

export interface AzuraLogFile {
  name: string;
  path: string;
  size: number;
  timestamp: number;
}

export interface UpdatePodcastEpisodePayload {
  title: string;
  link?: string | null;
  description?: string;
  publish_at?: number;
  explicit?: boolean;
  season_number?: number | null;
  episode_number?: number | null;
  artwork_file?: string | null; // Assuming base64 or similar if JSON
  media_file?: string | null | { originalFilename: string; uploadedPath: string };
}

export interface PodcastPlaylist {
  value: number;
  text: string;
  description: string | null;
}

export interface UpdatePodcastPayload {
  title: string;
  link?: string | null;
  description?: string;
  language: string;
  author?: string;
  email?: string;
  categories?: string[];
  is_enabled?: boolean;
  explicit?: boolean;
  branding_config?: {
    public_custom_html?: string | null;
    enable_op3_prefix?: boolean;
  };
  source?: "playlist" | "manual";
  playlist_id?: number | null;
  playlist_auto_publish?: boolean;
  artwork_file?: string | null;
}

export type CreatePodcastPayload = UpdatePodcastPayload;

export interface VuePodcastsResponse {
  languageOptions: Record<string, string>;
  categoriesOptions: {
    value: string;
    text: string;
    description: string | null;
  }[];
}

export interface StorageQuota {
  used: string;
  used_bytes: string;
  used_percent: number;
  available: string;
  available_bytes: string;
  quota: string | null;
  quota_bytes: string;
  is_full: boolean;
  num_files: number;
}

export interface ChartDataPoint {
  x: number;
  y: number;
}

export interface ChartMetric {
  label: string;
  type: string;
  fill: boolean;
  data: ChartDataPoint[];
}

export interface ChartAltValue {
  label: string;
  type: string;
  original: number;
  value: string;
}

export interface ChartAlt {
  label: string;
  values: ChartAltValue[];
}

export interface ChartSection {
  metrics: ChartMetric[];
  alt: ChartAlt[];
}

export interface DashboardChartsResponse {
  average: ChartSection;
  unique: ChartSection;
}
