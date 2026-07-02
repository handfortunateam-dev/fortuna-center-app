import { Changelog } from "./interfaces";

export const changelogTypeColors: Record<Changelog["type"], string> = {
    FEATURE: "success",
    BUG_FIX: "danger",
    IMPROVEMENT: "warning",
    UPDATE: "primary",
};
