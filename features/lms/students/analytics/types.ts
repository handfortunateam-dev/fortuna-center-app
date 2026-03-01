export interface StudentData {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  education: string | null;
  occupation: string | null;
  status: string;
  [key: string]: unknown;
}

export type AnalyticsData = {
  summary: {
    totalUsers: number;
    totalStudents: number;
    activeStudents: number;
    totalTeachers: number;
  };
  usersByRole: { role: string; value: number }[];
  registrations: { name: string; users: number }[];
  registrationsByYear: { name: string; users: number }[];
  registrationsByQuarter: { name: string; users: number }[];
  students: {
    gender: { name: string; value: number }[];
    education: { name: string; value: number }[];
    occupation: { name: string; value: number }[];
    status: { name: string; value: number }[];
    ages: { name: string; value: number }[];
    placeOfBirth: { name: string; value: number }[];
    avgAge: number;
  };
  teachers: {
    gender: { name: string; value: number }[];
    education: { name: string; value: number }[];
    ages: { name: string; value: number }[];
    avgAge: number;
  };
};

export interface TooltipPayload {
  name: string;
  value: number;
  color?: string;
  fill?: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}
