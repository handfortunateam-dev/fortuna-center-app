import { db } from "@/db";
import { systemSettings } from "@/db/schema/settings.schema";
import { eq } from "drizzle-orm";

export const settingsService = {
    // Get a setting by key
    get: async <T = any>(key: string, defaultValue: T | null = null): Promise<T | null> => {
        try {
            const setting = await db.query.systemSettings.findFirst({
                where: eq(systemSettings.key, key),
            });

            if (!setting || setting.value === null) return defaultValue;

            try {
                // Try to parse as JSON
                return JSON.parse(setting.value);
            } catch {
                // Fallback for plain strings that aren't valid JSON
                return setting.value as unknown as T;
            }
        } catch (error) {
            console.error(`Error fetching setting ${key}:`, error);
            return defaultValue;
        }
    },

    // Set a setting (always stores as JSON string for consistency if possible)
    set: async (key: string, value: any, description?: string) => {
        try {
            // Always stringify to ensure consistent retrieval
            // If value is a string "foo", it becomes "\"foo\""
            // If value is object, it becomes JSON
            const stringValue = JSON.stringify(value);

            const existing = await db.query.systemSettings.findFirst({
                where: eq(systemSettings.key, key),
            });

            if (existing) {
                await db
                    .update(systemSettings)
                    .set({
                        value: stringValue,
                        description: description || existing.description,
                        updatedAt: new Date(),
                    })
                    .where(eq(systemSettings.key, key));
            } else {
                await db.insert(systemSettings).values({
                    key,
                    value: stringValue,
                    description: description || "",
                });
            }
            return true;
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            throw error;
        }
    },

    // Get all settings map
    getAll: async (): Promise<Record<string, any>> => {
        try {
            const allSettings = await db.query.systemSettings.findMany();
            const settingsMap: Record<string, any> = {};

            for (const s of allSettings) {
                if (s.value === null) {
                    settingsMap[s.key] = null;
                    continue;
                }
                try {
                    settingsMap[s.key] = JSON.parse(s.value);
                } catch {
                    settingsMap[s.key] = s.value;
                }
            }
            return settingsMap;
        } catch (error) {
            console.error("Error fetching all settings:", error);
            return {};
        }
    },

    // Get all settings as a list (useful for admin UI)
    listAll: async () => {
        try {
            return await db.query.systemSettings.findMany();
        } catch (error) {
            console.error("Error listing settings:", error);
            return [];
        }
    }
};
