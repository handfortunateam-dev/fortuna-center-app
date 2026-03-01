import { ClassSchedule } from "../types";
import { timeToMinutes } from "./timeUtils";

export interface PositionedSchedule extends ClassSchedule {
    left: number;
    width: number;
    columnCount: number;
    columnIndex: number;
}

/**
 * Groups overlapping schedules together.
 */
function getOverlappingGroups(schedules: ClassSchedule[]): ClassSchedule[][] {
    const groups: ClassSchedule[][] = [];
    let currentGroup: ClassSchedule[] = [];
    let groupEndTime = -1;

    // Schedules must be sorted by start time
    const sorted = [...schedules].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    for (const schedule of sorted) {
        const start = timeToMinutes(schedule.startTime);
        const end = timeToMinutes(schedule.endTime);

        if (start >= groupEndTime) {
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
            }
            currentGroup = [schedule];
            groupEndTime = end;
        } else {
            currentGroup.push(schedule);
            groupEndTime = Math.max(groupEndTime, end);
        }
    }

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}

/**
 * Calculates the horizontal position (left, width) for schedules in an overlapping group.
 */
export function getPositionedSchedules(schedules: ClassSchedule[]): PositionedSchedule[] {
    if (schedules.length === 0) return [];

    const groups = getOverlappingGroups(schedules);
    const positionedSchedules: PositionedSchedule[] = [];

    for (const group of groups) {
        const columns: ClassSchedule[][] = [];

        for (const schedule of group) {
            const start = timeToMinutes(schedule.startTime);
            let placed = false;

            for (let i = 0; i < columns.length; i++) {
                const lastInColumn = columns[i][columns[i].length - 1];
                if (start >= timeToMinutes(lastInColumn.endTime)) {
                    columns[i].push(schedule);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                columns.push([schedule]);
            }
        }

        const columnCount = columns.length;
        for (let i = 0; i < columns.length; i++) {
            for (const schedule of columns[i]) {
                positionedSchedules.push({
                    ...schedule,
                    columnIndex: i,
                    columnCount: columnCount,
                    left: (i / columnCount) * 100,
                    width: (1 / columnCount) * 100,
                });
            }
        }
    }

    return positionedSchedules;
}
