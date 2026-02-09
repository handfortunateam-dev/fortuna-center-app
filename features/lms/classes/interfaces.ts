"use client";

export interface ClassItem {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  isActive: boolean;
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ClassFormValues {
  name: string;
  description?: string | null;
  code: string;
  isActive: boolean;
}

export interface TeacherClassItem {
  id: string;
  teacherId: string;
  teacherName?: string | null;
  classId: string;
  className?: string | null;
  assignedAt: string ;
  assignedBy?: string | null;
  assignedByName?: string | null;
}

export interface TeacherClassFormValues {
  teacherId: string;
  classId: string;
}

export interface ClassEnrollmentItem {
  id: string;
  studentId: string;
  studentName?: string | null;
  classId: string;
  className?: string | null;
  enrolledAt: string;
  enrolledBy?: string | null;
  enrolledByName?: string | null;
}

export interface ClassEnrollmentFormValues {
  studentId: string;
  classId: string;
}

export interface ClassListParams {
  q?: string;
  isActive?: boolean;
  createdBy?: string;
}

export interface TeacherClassFilters {
  classId?: string;
  teacherId?: string;
}

export interface ClassEnrollmentFilters {
  classId?: string;
  studentId?: string;
}
