"use client";

export interface ClassItem {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ClassFormValues {
  name: string;
  description?: string | null;
  code: string;
  isActive: boolean;
  createdBy: string;
}

export interface TeacherClassItem {
  id: string;
  teacherId: string;
  classId: string;
  assignedAt: string;
  assignedBy?: string | null;
}

export interface TeacherClassFormValues {
  teacherId: string;
  classId: string;
  assignedBy?: string | null;
}

export interface ClassEnrollmentItem {
  id: string;
  studentId: string;
  classId: string;
  enrolledAt: string;
  enrolledBy?: string | null;
}

export interface ClassEnrollmentFormValues {
  studentId: string;
  classId: string;
  enrolledBy?: string | null;
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
