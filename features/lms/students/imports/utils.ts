import {
    EDUCATION_LEVELS,
    OCCUPATION_TYPES,
} from "@/features/lms/students/constants";

export const EDUCATION_VALUE_MAP: Record<string, string> = {
    SD: "Elementary School",
    SMP: "Junior High School",
    SMA: "Senior High School",
    SMK: "Senior High School",
    D1: "Diploma 1",
    D2: "Diploma 2",
    D3: "Diploma 3",
    D4: "Diploma 4",
    S1: "Bachelor's Degree",
    S2: "Master's Degree",
    S3: "Doctoral Degree",
    "BACHELOR'S DEGREE": "Bachelor's Degree",
    "MASTER'S DEGREE": "Master's Degree",
    "DOCTORAL DEGREE": "Doctoral Degree",
    "ELEMENTARY SCHOOL": "Elementary School",
    "JUNIOR HIGH SCHOOL": "Junior High School",
    "SENIOR HIGH SCHOOL": "Senior High School",
    "DIPLOMA 1": "Diploma 1",
    "DIPLOMA 2": "Diploma 2",
    "DIPLOMA 3": "Diploma 3",
    "DIPLOMA 4": "Diploma 4",
};

export const OCCUPATION_VALUE_MAP: Record<string, string> = {
    STUDENT: "Student (School)",
    PELAJAR: "Student (School)",
    "STUDENT (SCHOOL)": "Student (School)",
    MAHASISWA: "Student (University)",
    "STUDENT (UNIVERSITY)": "Student (University)",
    KARYAWAN: "Private Employee",
    "KARYAWAN SWASTA": "Private Employee",
    "PRIVATE EMPLOYEE": "Private Employee",
    PNS: "Civil Servant",
    "CIVIL SERVANT": "Civil Servant",
    WIRASWASTA: "Entrepreneur",
    ENTREPRENEUR: "Entrepreneur",
    PROFESSIONAL: "Professional",
    GURU: "Teacher",
    TEACHER: "Teacher",
    DOKTER: "Doctor",
    DOCTOR: "Doctor",
    "IBU RUMAH TANGGA": "Housewife",
    HOUSEWIFE: "Housewife",
    FREELANCER: "Freelancer",
    "TIDAK BEKERJA": "Unemployed",
    UNEMPLOYED: "Unemployed",
    PENSIUN: "Retired",
    RETIRED: "Retired",
    LAINNYA: "Others",
    OTHERS: "Others",
    "-": "Unknown",
};

export const GENDER_MAP: Record<string, string> = {
    L: "male",
    "LAKI-LAKI": "male",
    MALE: "male",
    M: "male",
    P: "female",
    PEREMPUAN: "female",
    FEMALE: "female",
    F: "female",
};

/**
 * Maps known Excel column headers (uppercase, trimmed) to internal field names.
 * null  = skip the column.
 * "__*" = requires special multi-field processing.
 */
export const EXCEL_COLUMN_MAP: Record<string, string | null> = {
    NO: null, // skip: row number
    "REG DATE": "registrationDate",
    "FULL NAME": "__fullName",
    NAME: "nickname",
    GENDER: "gender",
    "PLACE & DATE OF BIRTH": "placeOfBirth",
    ADDRESS: "address",
    "PHONE NUMBER": "phone",
    "NAMA ORANG TUA": "phone", // dirty data variant where parents' name actually holds phone number
    "NAMA ORTU": "phone",
    "EDUCATION OR OCCUPATION": "__educationOrOccupation",
    "EDUCATION OR OCUPPATION": "__educationOrOccupation", // typo variant in some files
    "NO INDUK": "studentId",
    ID: "studentId", // Usually No Induk or an identification number
    // ── Indonesian column headers (e.g. SAMPLE_LTS format) ──────────────────
    "NO. INDUK": null, // skip: system auto-generates studentId in its own format
    "TGL. REGISTRASI": "registrationDate",
    "NAMA LENGKAP": "__fullName",
    "L/P": "gender",
    "TEMPAT TANGGAL LAHIR": "placeOfBirth",
    ALAMAT: "address",
    PEKERJAAN: "occupation",
    PENDIDIKAN: "education",
    __EMPTY: null, // skip: trailing empty columns (e.g. "PAS FOTO" note)
};

// ─── Pure helper functions ────────────────────────────────────────────────────

export const toTitleCase = (str: string): string =>
    str.toLowerCase().replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());

/**
 * Convert an Excel serial date number or "DD-MMM-YY" string → "YYYY-MM-DD".
 */
export const parseExcelDate = (value: unknown): string => {
    if (!value && value !== 0) return "";

    if (typeof value === "number") {
        // Excel serial → UTC date (accounts for Excel's 1900-leap-year bug via 25569 offset)
        const date = new Date(Math.round((value - 25569) * 86400 * 1000));
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, "0");
        const d = String(date.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    if (typeof value === "string") {
        const str = value.trim();
        const MONTH_MAP: Record<string, string> = {
            Jan: "01",
            Feb: "02",
            Mar: "03",
            Apr: "04",
            May: "05",
            Mei: "05",
            Jun: "06",
            Jul: "07",
            Aug: "08",
            Agu: "08",
            Ago: "08",
            Sep: "09",
            Oct: "10",
            Okt: "10",
            Nov: "11",
            Dec: "12",
            Des: "12",
        };
        // Matching DD-MMM-YY, DD MMM YYYY, etc. (e.g. "07-Sep-25" or "20 MEI 2012")
        const match = str.match(/^(\d{1,2})[-/\s]([A-Za-z]{3,})[-/\s](\d{2,4})$/);
        if (match) {
            const day = match[1].padStart(2, "0");
            const monthRaw = match[2].slice(0, 3); // take first 3 chars for mapping
            const monthKey =
                monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1).toLowerCase();
            const month = MONTH_MAP[monthKey] ?? "01";
            const year =
                match[3].length === 2
                    ? parseInt(match[3]) >= 50
                        ? `19${match[3]}`
                        : `20${match[3]}`
                    : match[3];
            return `${year}-${month}-${day}`;
        }
        // DD/MM/YYYY (e.g. "20/01/2025") — JS Date() would parse this wrong as MM/DD
        const ddmmyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
            const day = ddmmyyyy[1].padStart(2, "0");
            const month = ddmmyyyy[2].padStart(2, "0");
            const year = ddmmyyyy[3];
            return `${year}-${month}-${day}`;
        }
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
        return str;
    }
    return "";
};

/**
 * Normalize a single phone token: ensure leading "0" for Indonesian numbers.
 * (e.g. 85890765412 → "085890765412", +6281… → "081…")
 */
export const normalizeSinglePhone = (raw: string): string => {
    const cleaned = raw.replace(/[\s-]/g, "");
    if (cleaned.startsWith("+62")) return "0" + cleaned.slice(3);
    if (cleaned.startsWith("62") && cleaned.length >= 11) return "0" + cleaned.slice(2);
    if (cleaned.startsWith("8")) return "0" + cleaned;
    return cleaned;
};

/**
 * Normalize phone field. Handles:
 * - Excel numeric → string conversion
 * - Indonesian prefix normalisation (+62 / 62 / 8x → 0x)
 * - "X" as separator between two numbers
 *   (e.g. "081339496117X082147215233" → "081339496117, 082147215233")
 */
export const normalizePhone = (value: unknown): string => {
    if (!value && value !== 0) return "";

    const raw =
        typeof value === "number"
            ? String(Math.trunc(value))
            : String(value).trim();

    // Split on uppercase X that sits between digit sequences (dirty-data separator)
    return raw
        .split(/X(?=\d)/i)
        .map((part) => normalizeSinglePhone(part.trim()))
        .filter(Boolean)
        .join(", ");
};

export const normalizeGender = (value: unknown): string => {
    if (!value || typeof value !== "string") return "";
    return GENDER_MAP[value.trim().toUpperCase()] ?? value.trim().toLowerCase();
};

export const normalizeEducation = (value: unknown): string => {
    if (!value || typeof value !== "string") return "Unknown";
    const upper = value.trim().toUpperCase();
    return EDUCATION_VALUE_MAP[upper] ?? (value.trim() || "Unknown");
};

export const normalizeOccupation = (value: unknown): string => {
    if (!value || typeof value !== "string") return "Unknown";
    const upper = value.trim().toUpperCase();
    return OCCUPATION_VALUE_MAP[upper] ?? (value.trim() || "Unknown");
};

/**
 * Classify a combined "Education or Occupation" value into the correct field.
 * Checks lookup maps first, then valid values list, then keyword heuristics.
 */
export const classifyEducationOrOccupation = (
    value: unknown,
): { education: string; occupation: string } => {
    if (!value) return { education: "Unknown", occupation: "Unknown" };
    const str = String(value).trim();
    const upper = str.toUpperCase();

    if (EDUCATION_VALUE_MAP[upper])
        return { education: EDUCATION_VALUE_MAP[upper], occupation: "Unknown" };
    if (EDUCATION_LEVELS.some((e) => e.value.toUpperCase() === upper))
        return { education: str, occupation: "Unknown" };
    if (OCCUPATION_VALUE_MAP[upper])
        return { education: "Unknown", occupation: OCCUPATION_VALUE_MAP[upper] };
    if (OCCUPATION_TYPES.some((o) => o.value.toUpperCase() === upper))
        return { education: "Unknown", occupation: str };
    if (/school|diploma|bachelor|master|doctoral/i.test(str))
        return {
            education: normalizeEducation(str) || "Unknown",
            occupation: "Unknown",
        };
    return {
        education: "Unknown",
        occupation: normalizeOccupation(str) || "Unknown",
    };
};

/**
 * Split a full name string into firstName / middleName / lastName.
 * Applies Title Case to each part.
 */
export const splitFullName = (
    value: unknown,
): { firstName: string; middleName: string; lastName: string } => {
    if (!value || typeof value !== "string")
        return { firstName: "", middleName: "", lastName: "" };
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0)
        return { firstName: "", middleName: "", lastName: "" };
    const tc = (s: string) => toTitleCase(s);
    if (parts.length === 1)
        return { firstName: tc(parts[0]), middleName: "", lastName: "" };
    if (parts.length === 2)
        return { firstName: tc(parts[0]), middleName: "", lastName: tc(parts[1]) };
    return {
        firstName: tc(parts[0]),
        middleName: parts.slice(1, -1).map(tc).join(" "),
        lastName: tc(parts[parts.length - 1]),
    };
};

/**
 * Parse "PLACE & DATE OF BIRTH" column.
 * May be "City, DD-MMM-YY" (split), or just "City" (placeOfBirth only).
 */
export const parsePlaceAndDateOfBirth = (
    value: unknown,
): { placeOfBirth: string; dateOfBirth: string } => {
    if (!value) return { placeOfBirth: "", dateOfBirth: "" };
    const str = String(value).trim();
    const datePattern =
        /(\d{1,2}[-/\s][A-Za-z]{3,}[-/\s]\d{2,4}|\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/;
    const match = str.match(datePattern);
    if (match) {
        const datePart = match[1];
        const placePart = str
            .replace(datePart, "")
            .replace(/^[,\s]+|[,\s]+$/g, "")
            .trim();
        return { placeOfBirth: placePart, dateOfBirth: parseExcelDate(datePart) };
    }
    return { placeOfBirth: str, dateOfBirth: "" };
};
