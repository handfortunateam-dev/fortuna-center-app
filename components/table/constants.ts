// ==================== RESOURCE CONFIGURATION ====================
export const RESOURCE_CONFIG: Record<
    string,
    { keyField?: string; idField?: string; nameField?: string }
> = {
    "/blog-cms/posts": { keyField: "id", idField: "id", nameField: "title" },
};
