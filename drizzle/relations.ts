import { relations } from "drizzle-orm/relations";
import { users, classes, classEnrollments, teacherClasses, assignments, students, assignmentSubmissions, classSessions, classAttendances, classSchedules, posts, postToCategories, postCategories, postToTags, postTags, postComments, postLikes } from "./schema";

export const classesRelations = relations(classes, ({one, many}) => ({
	user: one(users, {
		fields: [classes.createdBy],
		references: [users.id]
	}),
	classEnrollments: many(classEnrollments),
	teacherClasses: many(teacherClasses),
	assignments: many(assignments),
	classSchedules: many(classSchedules),
}));

export const usersRelations = relations(users, ({many}) => ({
	classes: many(classes),
	classEnrollments_studentId: many(classEnrollments, {
		relationName: "classEnrollments_studentId_users_id"
	}),
	classEnrollments_enrolledBy: many(classEnrollments, {
		relationName: "classEnrollments_enrolledBy_users_id"
	}),
	teacherClasses_teacherId: many(teacherClasses, {
		relationName: "teacherClasses_teacherId_users_id"
	}),
	teacherClasses_assignedBy: many(teacherClasses, {
		relationName: "teacherClasses_assignedBy_users_id"
	}),
	assignments: many(assignments),
	students: many(students),
	assignmentSubmissions_studentId: many(assignmentSubmissions, {
		relationName: "assignmentSubmissions_studentId_users_id"
	}),
	assignmentSubmissions_gradedBy: many(assignmentSubmissions, {
		relationName: "assignmentSubmissions_gradedBy_users_id"
	}),
	classAttendances_studentId: many(classAttendances, {
		relationName: "classAttendances_studentId_users_id"
	}),
	classAttendances_recordedBy: many(classAttendances, {
		relationName: "classAttendances_recordedBy_users_id"
	}),
	classSessions_generatedBy: many(classSessions, {
		relationName: "classSessions_generatedBy_users_id"
	}),
	classSessions_startedBy: many(classSessions, {
		relationName: "classSessions_startedBy_users_id"
	}),
	classSessions_completedBy: many(classSessions, {
		relationName: "classSessions_completedBy_users_id"
	}),
	classSchedules_teacherId: many(classSchedules, {
		relationName: "classSchedules_teacherId_users_id"
	}),
	classSchedules_createdBy: many(classSchedules, {
		relationName: "classSchedules_createdBy_users_id"
	}),
	posts: many(posts),
	postComments: many(postComments),
	postLikes: many(postLikes),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({one}) => ({
	user_studentId: one(users, {
		fields: [classEnrollments.studentId],
		references: [users.id],
		relationName: "classEnrollments_studentId_users_id"
	}),
	class: one(classes, {
		fields: [classEnrollments.classId],
		references: [classes.id]
	}),
	user_enrolledBy: one(users, {
		fields: [classEnrollments.enrolledBy],
		references: [users.id],
		relationName: "classEnrollments_enrolledBy_users_id"
	}),
}));

export const teacherClassesRelations = relations(teacherClasses, ({one}) => ({
	user_teacherId: one(users, {
		fields: [teacherClasses.teacherId],
		references: [users.id],
		relationName: "teacherClasses_teacherId_users_id"
	}),
	class: one(classes, {
		fields: [teacherClasses.classId],
		references: [classes.id]
	}),
	user_assignedBy: one(users, {
		fields: [teacherClasses.assignedBy],
		references: [users.id],
		relationName: "teacherClasses_assignedBy_users_id"
	}),
}));

export const assignmentsRelations = relations(assignments, ({one, many}) => ({
	class: one(classes, {
		fields: [assignments.classId],
		references: [classes.id]
	}),
	user: one(users, {
		fields: [assignments.teacherId],
		references: [users.id]
	}),
	assignmentSubmissions: many(assignmentSubmissions),
}));

export const studentsRelations = relations(students, ({one}) => ({
	user: one(users, {
		fields: [students.userId],
		references: [users.id]
	}),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({one}) => ({
	assignment: one(assignments, {
		fields: [assignmentSubmissions.assignmentId],
		references: [assignments.id]
	}),
	user_studentId: one(users, {
		fields: [assignmentSubmissions.studentId],
		references: [users.id],
		relationName: "assignmentSubmissions_studentId_users_id"
	}),
	user_gradedBy: one(users, {
		fields: [assignmentSubmissions.gradedBy],
		references: [users.id],
		relationName: "assignmentSubmissions_gradedBy_users_id"
	}),
}));

export const classAttendancesRelations = relations(classAttendances, ({one}) => ({
	classSession: one(classSessions, {
		fields: [classAttendances.sessionId],
		references: [classSessions.id]
	}),
	user_studentId: one(users, {
		fields: [classAttendances.studentId],
		references: [users.id],
		relationName: "classAttendances_studentId_users_id"
	}),
	user_recordedBy: one(users, {
		fields: [classAttendances.recordedBy],
		references: [users.id],
		relationName: "classAttendances_recordedBy_users_id"
	}),
}));

export const classSessionsRelations = relations(classSessions, ({one, many}) => ({
	classAttendances: many(classAttendances),
	classSchedule: one(classSchedules, {
		fields: [classSessions.scheduleId],
		references: [classSchedules.id]
	}),
	user_generatedBy: one(users, {
		fields: [classSessions.generatedBy],
		references: [users.id],
		relationName: "classSessions_generatedBy_users_id"
	}),
	user_startedBy: one(users, {
		fields: [classSessions.startedBy],
		references: [users.id],
		relationName: "classSessions_startedBy_users_id"
	}),
	user_completedBy: one(users, {
		fields: [classSessions.completedBy],
		references: [users.id],
		relationName: "classSessions_completedBy_users_id"
	}),
}));

export const classSchedulesRelations = relations(classSchedules, ({one, many}) => ({
	classSessions: many(classSessions),
	class: one(classes, {
		fields: [classSchedules.classId],
		references: [classes.id]
	}),
	user_teacherId: one(users, {
		fields: [classSchedules.teacherId],
		references: [users.id],
		relationName: "classSchedules_teacherId_users_id"
	}),
	user_createdBy: one(users, {
		fields: [classSchedules.createdBy],
		references: [users.id],
		relationName: "classSchedules_createdBy_users_id"
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	user: one(users, {
		fields: [posts.authorId],
		references: [users.id]
	}),
	postToCategories: many(postToCategories),
	postToTags: many(postToTags),
	postComments: many(postComments),
	postLikes: many(postLikes),
}));

export const postToCategoriesRelations = relations(postToCategories, ({one}) => ({
	post: one(posts, {
		fields: [postToCategories.postId],
		references: [posts.id]
	}),
	postCategory: one(postCategories, {
		fields: [postToCategories.categoryId],
		references: [postCategories.id]
	}),
}));

export const postCategoriesRelations = relations(postCategories, ({many}) => ({
	postToCategories: many(postToCategories),
}));

export const postToTagsRelations = relations(postToTags, ({one}) => ({
	post: one(posts, {
		fields: [postToTags.postId],
		references: [posts.id]
	}),
	postTag: one(postTags, {
		fields: [postToTags.tagId],
		references: [postTags.id]
	}),
}));

export const postTagsRelations = relations(postTags, ({many}) => ({
	postToTags: many(postToTags),
}));

export const postCommentsRelations = relations(postComments, ({one, many}) => ({
	post: one(posts, {
		fields: [postComments.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postComments.authorId],
		references: [users.id]
	}),
	postComment: one(postComments, {
		fields: [postComments.parentId],
		references: [postComments.id],
		relationName: "postComments_parentId_postComments_id"
	}),
	postComments: many(postComments, {
		relationName: "postComments_parentId_postComments_id"
	}),
}));

export const postLikesRelations = relations(postLikes, ({one}) => ({
	post: one(posts, {
		fields: [postLikes.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postLikes.userId],
		references: [users.id]
	}),
}));