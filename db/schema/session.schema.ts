import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns.helper';

// Enums
export const sessionStatusEnum = pgEnum('session_status', ['pending', 'live', 'ended', 'error']);
export const inputTypeEnum = pgEnum('input_type', ['browser', 'rtmp', 'audio', 'youtube']);
export const youtubePrivacyEnum = pgEnum('youtube_privacy', ['public', 'private', 'unlisted']);

export const liveSessions = pgTable('live_sessions', {
  ...id,
  title: text('title').notNull(),
  description: text('description'),
  status: sessionStatusEnum('status').default('pending').notNull(),
  inputType: inputTypeEnum('input_type').default('browser').notNull(),

  // For RTMP (LiveKit)
  ingressId: text('ingress_id'),
  streamKey: text('stream_key'),
  rtmpUrl: text('rtmp_url'),

  // For WebRTC/General (LiveKit)
  roomId: text('room_id'), // LiveKit Room Name

  // For YouTube Live Streaming
  youtubeBroadcastId: text('youtube_broadcast_id'), // YouTube broadcast ID
  youtubeStreamId: text('youtube_stream_id'), // YouTube stream ID
  youtubeVideoId: text('youtube_video_id'), // Video ID after broadcast ends
  youtubeLiveChatId: text('youtube_live_chat_id'), // Live chat ID
  youtubeStreamUrl: text('youtube_stream_url'), // RTMP ingestion URL
  youtubeStreamKey: text('youtube_stream_key'), // Stream key for YouTube
  youtubePrivacy: youtubePrivacyEnum('youtube_privacy').default('public'), // Privacy status
  youtubeEnableDvr: boolean('youtube_enable_dvr').default(true), // Enable DVR controls
  youtubeEnableEmbed: boolean('youtube_enable_embed').default(true), // Enable embedding
  youtubeEnableAutoStart: boolean('youtube_enable_auto_start').default(true), // Auto start
  youtubeEnableAutoStop: boolean('youtube_enable_auto_stop').default(true), // Auto stop

  isPublic: boolean('is_public').default(true),
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  ...timestamps,
});

export type LiveSession = typeof liveSessions.$inferSelect;
export type NewLiveSession = typeof liveSessions.$inferInsert;
