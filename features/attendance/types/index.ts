import { ClassAttendance } from "@/db/schema/class-attendance.schema";
import { ClassSession } from "@/db/schema/class-session.schema";
import { ClassSchedule } from "@/db/schema/class-schedule.schema";
import { Class } from "@/db/schema/class.schema";

export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "sick";

export interface AttendanceRecord extends Partial<ClassAttendance> {
    id: string;
    sessionId: string;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    status: AttendanceStatus;
    notes?: string | null;
    checkedInAt?: Date | null;
}

export interface StudentAttendanceSummary {
    classId: string;
    className: string;
    totalSessions: number;
    studentStats: {
        present: number;
        absent: number;
        late: number;
        excused: number;
        sick: number;
    };
    history: (ClassAttendance & {
        session: ClassSession & {
            date: string; // serialized date
        };
    })[];
}
