// Scheduler Constants & Mock Data

import { Teacher, ClassRoom, ClassSchedule, SchedulerConfig } from "../types";

// Day of week mapping
export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
] as const;

// Teacher colors palette
export const TEACHER_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Orange
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
] as const;

// Mock Teachers
export const MOCK_TEACHERS: Teacher[] = [
  { id: "t1", name: "Ariel", color: "#3B82F6", avatar: "" },
  { id: "t2", name: "Sarah", color: "#10B981", avatar: "" },
  { id: "t3", name: "Michael", color: "#F59E0B", avatar: "" },
  { id: "t4", name: "Jessica", color: "#8B5CF6", avatar: "" },
];

// Mock Classes
export const MOCK_CLASSES: ClassRoom[] = [
  { id: "c1", name: "Children A", level: "Beginner", maxStudents: 15 },
  { id: "c2", name: "Children B", level: "Beginner", maxStudents: 15 },
  { id: "c3", name: "Teen A", level: "Intermediate", maxStudents: 12 },
  { id: "c4", name: "Teen B", level: "Intermediate", maxStudents: 12 },
  { id: "c5", name: "Adult A", level: "Advanced", maxStudents: 10 },
];

// Mock Schedules based on Teacher Ariel's example
export const MOCK_SCHEDULES: ClassSchedule[] = [
  // Teacher Ariel - Children A (Monday & Thursday 15:00-16:30)
  {
    id: "sch1",
    classId: "c1",
    className: "Children A",
    teacherId: "t1",
    teacherName: "Ariel",
    teacherColor: "#3B82F6",
    startTime: "15:00",
    endTime: "16:30",
    dayOfWeek: 1, // Monday
    hasAttendance: true,
    enrolledStudents: 12,
    location: "Room 101",
  },
  {
    id: "sch2",
    classId: "c1",
    className: "Children A",
    teacherId: "t1",
    teacherName: "Ariel",
    teacherColor: "#3B82F6",
    startTime: "15:00",
    endTime: "16:30",
    dayOfWeek: 4, // Thursday
    hasAttendance: true,
    enrolledStudents: 12,
    location: "Room 101",
  },
  // Teacher Ariel - Children B (Tuesday & Friday 17:00-18:30)
  {
    id: "sch3",
    classId: "c2",
    className: "Children B",
    teacherId: "t1",
    teacherName: "Ariel",
    teacherColor: "#3B82F6",
    startTime: "17:00",
    endTime: "18:30",
    dayOfWeek: 2, // Tuesday
    hasAttendance: true,
    enrolledStudents: 10,
    location: "Room 102",
  },
  {
    id: "sch4",
    classId: "c2",
    className: "Children B",
    teacherId: "t1",
    teacherName: "Ariel",
    teacherColor: "#3B82F6",
    startTime: "17:00",
    endTime: "18:30",
    dayOfWeek: 5, // Friday
    hasAttendance: true,
    enrolledStudents: 10,
    location: "Room 102",
  },
  // Teacher Sarah - Teen A (Monday & Wednesday 09:00-10:30)
  {
    id: "sch5",
    classId: "c3",
    className: "Teen A",
    teacherId: "t2",
    teacherName: "Sarah",
    teacherColor: "#10B981",
    startTime: "09:00",
    endTime: "10:30",
    dayOfWeek: 1, // Monday
    hasAttendance: true,
    enrolledStudents: 8,
    location: "Room 201",
  },
  {
    id: "sch6",
    classId: "c3",
    className: "Teen A",
    teacherId: "t2",
    teacherName: "Sarah",
    teacherColor: "#10B981",
    startTime: "09:00",
    endTime: "10:30",
    dayOfWeek: 3, // Wednesday
    hasAttendance: true,
    enrolledStudents: 8,
    location: "Room 201",
  },
  // Teacher Michael - Adult A (Tuesday & Thursday 19:00-20:30)
  {
    id: "sch7",
    classId: "c5",
    className: "Adult A",
    teacherId: "t3",
    teacherName: "Michael",
    teacherColor: "#F59E0B",
    startTime: "19:00",
    endTime: "20:30",
    dayOfWeek: 2, // Tuesday
    hasAttendance: true,
    enrolledStudents: 6,
    location: "Room 301",
  },
  {
    id: "sch8",
    classId: "c5",
    className: "Adult A",
    teacherId: "t3",
    teacherName: "Michael",
    teacherColor: "#F59E0B",
    startTime: "19:00",
    endTime: "20:30",
    dayOfWeek: 4, // Thursday
    hasAttendance: true,
    enrolledStudents: 6,
    location: "Room 301",
  },
];

// Default scheduler configuration
export const DEFAULT_CONFIG: SchedulerConfig = {
  startHour: 7,
  endHour: 21,
  slotDuration: 30,
  weekStartsOn: 1,
};

// Time slot height in pixels (for 30 min slot)
export const SLOT_HEIGHT = 40;

// Class card minimum height (1.5 hours = 3 slots = 120px)
export const MIN_CARD_HEIGHT = SLOT_HEIGHT * 3;
