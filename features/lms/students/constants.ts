// Education levels constants
export const EDUCATION_LEVELS = [
    { label: "Kindergarten", value: "Kindergarten" },
    { label: "Elementary School (SD)", value: "Elementary School" },
    { label: "Junior High School (SMP)", value: "Junior High School" },
    { label: "Senior High School (SMA/SMK)", value: "Senior High School" },
    { label: "Diploma 1 (D1)", value: "Diploma 1" },
    { label: "Diploma 2 (D2)", value: "Diploma 2" },
    { label: "Diploma 3 (D3)", value: "Diploma 3" },
    { label: "Diploma 4 (D4)", value: "Diploma 4" },
    { label: "Bachelor's Degree (S1)", value: "Bachelor's Degree" },
    { label: "Master's Degree (S2)", value: "Master's Degree" },
    { label: "Doctoral Degree (S3)", value: "Doctoral Degree" },
    { label: "Others", value: "Others" },
    { label: "Unknown", value: "Unknown" },
];

// Occupation types constants
export const OCCUPATION_TYPES = [
    { label: "Student (School)", value: "Student (School)" },
    { label: "Student (University)", value: "Student (University)" },
    { label: "Private Employee", value: "Private Employee" },
    { label: "Civil Servant", value: "Civil Servant" },
    { label: "Entrepreneur", value: "Entrepreneur" },
    { label: "Employee", value: "Employee" },
    { label: "Professional", value: "Professional" },
    { label: "Housewife", value: "Housewife" },
    { label: "Freelancer", value: "Freelancer" },
    { label: "Teacher", value: "Teacher" },
    { label: "Doctor", value: "Doctor" },
    { label: "Unemployed", value: "Unemployed" },
    { label: "Retired", value: "Retired" },
    { label: "Others", value: "Others" },
    { label: "Unknown", value: "Unknown" },
    { label: "Lecturer", value: "Lecturer" },
    { label: "Police Officer", value: "Police Officer" },
    { label: "Military", value: "Military" },
    { label: "Staff/Employee BUMN", value: "Staff/Employee BUMN" },
    { label: "Midwife", value: "Midwife" },

];

// Export types for TypeScript
export type EducationLevel = typeof EDUCATION_LEVELS[number]["value"];
export type OccupationType = typeof OCCUPATION_TYPES[number]["value"];
