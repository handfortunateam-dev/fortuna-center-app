import { format, formatDistance, formatRelative, isValid, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

/**
 * Format date to readable string
 * @param date - Date string, Date object, or null/undefined
 * @param formatStr - Format string (default: "PPP" - e.g., "January 19th, 2026")
 * @param fallback - Fallback string if date is invalid (default: "-")
 * @returns Formatted date string or fallback
 */
export function formatDate(
    date: string | Date | null | undefined,
    formatStr: string = "PPP",
    fallback: string = "-"
): string {
    if (!date) return fallback;

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date;
        if (!isValid(dateObj)) return fallback;
        return format(dateObj, formatStr);
    } catch (error) {
        console.error("Error formatting date:", error);
        return fallback;
    }
}

/**
 * Format date to short format (e.g., "19/01/2026")
 */
export function formatDateShort(
    date: string | Date | null | undefined,
    fallback: string = "-"
): string {
    return formatDate(date, "dd/MM/yyyy", fallback);
}

/**
 * Format date to long format (e.g., "January 19th, 2026")
 */
export function formatDateLong(
    date: string | Date | null | undefined,
    fallback: string = "-"
): string {
    return formatDate(date, "PPP", fallback);
}

/**
 * Format date with time (e.g., "19/01/2026 14:30")
 */
export function formatDateTime(
    date: string | Date | null | undefined,
    fallback: string = "-"
): string {
    return formatDate(date, "dd/MM/yyyy HH:mm", fallback);
}

/**
 * Format date with full time (e.g., "January 19th, 2026 at 2:30 PM")
 */
export function formatDateTimeLong(
    date: string | Date | null | undefined,
    fallback: string = "-"
): string {
    return formatDate(date, "PPP 'at' p", fallback);
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatDateRelative(
    date: string | Date | null | undefined,
    baseDate: Date = new Date(),
    fallback: string = "-"
): string {
    if (!date) return fallback;

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date;
        if (!isValid(dateObj)) return fallback;
        return formatDistance(dateObj, baseDate, { addSuffix: true });
    } catch (error) {
        console.error("Error formatting relative date:", error);
        return fallback;
    }
}

/**
 * Format date to relative format (e.g., "today at 2:30 PM", "yesterday at 10:00 AM")
 */
export function formatDateRelativeCalendar(
    date: string | Date | null | undefined,
    baseDate: Date = new Date(),
    fallback: string = "-"
): string {
    if (!date) return fallback;

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date;
        if (!isValid(dateObj)) return fallback;
        return formatRelative(dateObj, baseDate);
    } catch (error) {
        console.error("Error formatting relative calendar date:", error);
        return fallback;
    }
}

/**
 * Format date with Indonesian locale
 */
export function formatDateId(
    date: string | Date | null | undefined,
    formatStr: string = "PPP",
    fallback: string = "-"
): string {
    if (!date) return fallback;

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date;
        if (!isValid(dateObj)) return fallback;
        return format(dateObj, formatStr, { locale: localeId });
    } catch (error) {
        console.error("Error formatting date with Indonesian locale:", error);
        return fallback;
    }
}
