import { pgTable, unique, text, timestamp, uuid, boolean, foreignKey, varchar, integer, jsonb, date, smallint, time, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const assignmentStatus = pgEnum("assignment_status", ['draft', 'published', 'closed'])
export const attendanceStatus = pgEnum("attendance_status", ['present', 'absent', 'late', 'excused', 'sick'])
export const classSessionStatus = pgEnum("class_session_status", ['scheduled', 'not_started', 'in_progress', 'completed', 'cancelled'])
export const dayOfWeek = pgEnum("day_of_week", ['0', '1', '2', '3', '4', '5', '6'])
export const inputType = pgEnum("input_type", ['browser', 'rtmp', 'audio', 'youtube'])
export const postStatus = pgEnum("post_status", ['draft', 'published', 'archived'])
export const sessionStatus = pgEnum("session_status", ['pending', 'live', 'ended', 'error'])
export const submissionStatus = pgEnum("submission_status", ['pending', 'submitted', 'graded', 'late'])
export const userRole = pgEnum("user_role", ['ADMINISTRATIVE_EMPLOYEE', 'ADMIN', 'TEACHER', 'STUDENT'])
export const youtubePrivacy = pgEnum("youtube_privacy", ['public', 'private', 'unlisted'])


export const systemSettings = pgTable("system_settings", {
	id: text().primaryKey().notNull(),
	key: text().notNull(),
	value: text(),
	description: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("system_settings_key_unique").on(table.key),
]);

export const liveSessions = pgTable("live_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	status: sessionStatus().default('pending').notNull(),
	inputType: inputType("input_type").default('browser').notNull(),
	ingressId: text("ingress_id"),
	streamKey: text("stream_key"),
	rtmpUrl: text("rtmp_url"),
	roomId: text("room_id"),
	youtubeBroadcastId: text("youtube_broadcast_id"),
	youtubeStreamId: text("youtube_stream_id"),
	youtubeVideoId: text("youtube_video_id"),
	youtubeLiveChatId: text("youtube_live_chat_id"),
	youtubeStreamUrl: text("youtube_stream_url"),
	youtubeStreamKey: text("youtube_stream_key"),
	youtubePrivacy: youtubePrivacy("youtube_privacy").default('public'),
	youtubeEnableDvr: boolean("youtube_enable_dvr").default(true),
	youtubeEnableEmbed: boolean("youtube_enable_embed").default(true),
	youtubeEnableAutoStart: boolean("youtube_enable_auto_start").default(true),
	youtubeEnableAutoStop: boolean("youtube_enable_auto_stop").default(true),
	isPublic: boolean("is_public").default(true),
	scheduledAt: timestamp("scheduled_at", { mode: 'string' }),
	startedAt: timestamp("started_at", { mode: 'string' }),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const classes = pgTable("classes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	code: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "classes_created_by_users_id_fk"
		}),
	unique("classes_code_unique").on(table.code),
]);

export const classEnrollments = pgTable("class_enrollments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	studentId: uuid("student_id").notNull(),
	classId: uuid("class_id").notNull(),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).defaultNow().notNull(),
	enrolledBy: uuid("enrolled_by"),
}, (table) => [
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "class_enrollments_student_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "class_enrollments_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.enrolledBy],
			foreignColumns: [users.id],
			name: "class_enrollments_enrolled_by_users_id_fk"
		}),
]);

export const teacherClasses = pgTable("teacher_classes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teacherId: uuid("teacher_id").notNull(),
	classId: uuid("class_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
	assignedBy: uuid("assigned_by"),
}, (table) => [
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "teacher_classes_teacher_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "teacher_classes_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [users.id],
			name: "teacher_classes_assigned_by_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: text().notNull(),
	role: userRole().notNull(),
	clerkId: varchar("clerk_id", { length: 255 }).notNull(),
	image: varchar({ length: 500 }),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_clerk_id_unique").on(table.clerkId),
]);

export const assignments = pgTable("assignments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	instructions: text(),
	classId: uuid("class_id").notNull(),
	teacherId: uuid("teacher_id").notNull(),
	status: assignmentStatus().default('draft').notNull(),
	maxScore: integer("max_score").default(100),
	dueDate: timestamp("due_date", { mode: 'string' }),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	attachments: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "assignments_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "assignments_teacher_id_users_id_fk"
		}),
]);

export const students = pgTable("students", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	middleName: text("middle_name"),
	lastName: text("last_name").notNull(),
	email: text().notNull(),
	phone: text(),
	address: text(),
	userId: uuid("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "students_user_id_users_id_fk"
		}),
	unique("students_email_unique").on(table.email),
	unique("students_user_id_unique").on(table.userId),
]);

export const assignmentSubmissions = pgTable("assignment_submissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	assignmentId: uuid("assignment_id").notNull(),
	studentId: uuid("student_id").notNull(),
	content: text(),
	attachments: jsonb(),
	status: submissionStatus().default('pending').notNull(),
	score: integer(),
	feedback: text(),
	gradedBy: uuid("graded_by"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	gradedAt: timestamp("graded_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [assignments.id],
			name: "assignment_submissions_assignment_id_assignments_id_fk"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "assignment_submissions_student_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.gradedBy],
			foreignColumns: [users.id],
			name: "assignment_submissions_graded_by_users_id_fk"
		}),
]);

export const classAttendances = pgTable("class_attendances", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id").notNull(),
	studentId: uuid("student_id").notNull(),
	status: attendanceStatus().default('absent').notNull(),
	notes: text(),
	checkedInAt: timestamp("checked_in_at", { mode: 'string' }),
	recordedBy: uuid("recorded_by"),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [classSessions.id],
			name: "class_attendances_session_id_class_sessions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "class_attendances_student_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recordedBy],
			foreignColumns: [users.id],
			name: "class_attendances_recorded_by_users_id_fk"
		}),
]);

export const classSessions = pgTable("class_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	scheduleId: uuid("schedule_id").notNull(),
	date: date().notNull(),
	status: classSessionStatus().default('scheduled').notNull(),
	actualStartTime: timestamp("actual_start_time", { mode: 'string' }),
	actualEndTime: timestamp("actual_end_time", { mode: 'string' }),
	notes: text(),
	cancellationReason: text("cancellation_reason"),
	generatedBy: uuid("generated_by"),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow().notNull(),
	startedBy: uuid("started_by"),
	completedBy: uuid("completed_by"),
}, (table) => [
	foreignKey({
			columns: [table.scheduleId],
			foreignColumns: [classSchedules.id],
			name: "class_sessions_schedule_id_class_schedules_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.generatedBy],
			foreignColumns: [users.id],
			name: "class_sessions_generated_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.startedBy],
			foreignColumns: [users.id],
			name: "class_sessions_started_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.completedBy],
			foreignColumns: [users.id],
			name: "class_sessions_completed_by_users_id_fk"
		}),
]);

export const classSchedules = pgTable("class_schedules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	classId: uuid("class_id").notNull(),
	teacherId: uuid("teacher_id").notNull(),
	dayOfWeek: smallint("day_of_week").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	location: text(),
	notes: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "class_schedules_class_id_classes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "class_schedules_teacher_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "class_schedules_created_by_users_id_fk"
		}),
]);

export const posts = pgTable("posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	excerpt: text(),
	coverImage: varchar("cover_image", { length: 500 }),
	authorId: uuid("author_id").notNull(),
	status: postStatus().default('draft').notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	likeCount: integer("like_count").default(0).notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "posts_author_id_users_id_fk"
		}),
]);

export const postToCategories = pgTable("post_to_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_to_categories_post_id_posts_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [postCategories.id],
			name: "post_to_categories_category_id_post_categories_id_fk"
		}),
]);

export const postCategories = pgTable("post_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("post_categories_name_unique").on(table.name),
	unique("post_categories_slug_unique").on(table.slug),
]);

export const postToTags = pgTable("post_to_tags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	tagId: uuid("tag_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_to_tags_post_id_posts_id_fk"
		}),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [postTags.id],
			name: "post_to_tags_tag_id_post_tags_id_fk"
		}),
]);

export const postTags = pgTable("post_tags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("post_tags_name_unique").on(table.name),
	unique("post_tags_slug_unique").on(table.slug),
]);

export const postComments = pgTable("post_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	authorId: uuid("author_id").notNull(),
	content: text().notNull(),
	parentId: uuid("parent_id"),
	isEdited: boolean("is_edited").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_comments_post_id_posts_id_fk"
		}),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "post_comments_author_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "post_comments_parent_id_post_comments_id_fk"
		}),
]);

export const postLikes = pgTable("post_likes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_likes_post_id_posts_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "post_likes_user_id_users_id_fk"
		}),
]);
