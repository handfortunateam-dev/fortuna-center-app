import { ReactNode } from "react";
import { Selection } from "@heroui/react";
import { AddButtonConfig, ActionButtonConfig } from "@/components/button/ActionButtons";

// ==================== UTILITY TYPES ====================

/**
 * Extract keys from a type T that have primitive values (string | number | boolean)
 * This helps with IntelliSense when defining column keys
 */
export type PrimitiveKeys<T> = {
    [K in keyof T]: T[K] extends string | number | boolean | null | undefined
    ? K
    : never;
}[keyof T];

/**
 * Extract all keys from a type T (including nested objects)
 * Useful for column key suggestions
 */
export type AllKeys<T> = T extends object ? keyof T : never;

/**
 * Column definition with strict typing
 * @template T - The data item type
 * @template K - Optional: Specific key constraint (defaults to keyof T | string for flexibility)
 */
export interface Column<T = unknown, K extends string = string> {
    /** Column key - should match a field in T or be a custom key like "actions" */
    key: K | (T extends object ? keyof T & string : string) | "actions";
    /** Display label for the column header */
    label: string;
    /** Column alignment */
    align?: "start" | "center" | "end";
    /**
     * Custom value renderer - receives the full typed item
     * Use this for computed values, formatting, or rendering custom components
     * @example
     * value: (item) => `${item.firstName} ${item.lastName}`
     * value: (item) => <Badge color={item.status === 'active' ? 'success' : 'default'}>{item.status}</Badge>
     */
    value?: (item: T) => ReactNode;
    /** Can this column be hidden via column visibility toggle? (default: true) */
    hideable?: boolean;
    /** Is this column visible by default? (default: true) */
    defaultVisible?: boolean;
}

/**
 * Bulk action configuration with proper typing
 * @template T - The data item type
 */
export interface BulkAction<T = unknown> {
    /** Unique key for this action */
    key: string;
    /** Button label */
    label: string;
    /** Iconify icon name (e.g., "lucide:trash-2") */
    icon?: string;
    /** Button color */
    color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
    /**
     * Action handler - receives typed items
     * @param selectedIds - Array of selected item IDs
     * @param selectedItems - Array of selected items with full type
     */
    onAction: (selectedIds: string[], selectedItems: T[]) => Promise<void> | void;
    /** Confirmation dialog title (if provided, shows confirmation before action) */
    confirmTitle?: string;
    /** Confirmation dialog message function */
    confirmMessage?: (count: number) => string;
}

/**
 * Helper type: Makes defining columns with full IntelliSense super simple!
 *
 * @template T - Your data item type
 *
 * @example
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 *   status: 'active' | 'inactive';
 * }
 *
 * const columns: Columns<User> = [
 *   { key: "name", label: "Nama" },  // IntelliSense suggests: id, name, email, status
 *   { key: "email", label: "Email" },
 *   {
 *     key: "status",
 *     label: "Status",
 *     value: (user) => (  // 'user' is typed as User!
 *       <Badge color={user.status === 'active' ? 'success' : 'default'}>
 *         {user.status}
 *       </Badge>
 *     )
 *   },
 *   { key: "actions", label: "Aksi" }  // "actions" is always valid
 * ];
 */
export type Columns<T> = Array<Column<T>>;

/**
 * Helper type for creating a single column with IntelliSense
 * @example
 * const nameColumn: ColumnDef<User> = { key: "name", label: "Nama" };
 */
export type ColumnDef<T> = Column<T>;

/**
 * Internal row representation with preserved original item
 * @template T - The original data item type
 */
export interface TypedRow<T = unknown> {
    /** Unique key for React rendering */
    key: string;
    /** ID field value (for actions) */
    id: string;
    /** Name field value (for delete confirmation) */
    name: string;
    /** Original typed item - use this for type-safe access */
    _originalItem: T;
    /** Spread data fields for table cell access */
    [key: string]: string | number | boolean | ReactNode | T | undefined;
}

/**
 * Legacy Row type for backwards compatibility
 * @deprecated Use TypedRow<T> for better type safety
 */
export interface Row {
    key: string;
    id?: string;
    name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _originalItem?: any;
    [key: string]: string | number | boolean | ReactNode | undefined;
}

// Helper type to extract data from API response
// Supports multiple formats:
// - T[] (direct array)
// - { data: T[] } (nested once)
// - { data?: T[] } (nested once, optional)
// - { data: { data: T[] } } (nested twice)
// - { data?: { data?: T[] } } (nested twice, optional)
export type DataExtractor<T> =
    | T[]
    | { data: T[] }
    | { data?: T[] }
    | { data: { data: T[] } }
    | { data?: { data?: T[] } };

export interface OptionsMenuItem {
    key: string;
    label: string;
    icon?: ReactNode;
    color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
    variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow";
    onPress?: () => void;
}

export interface ListGridProps<T = unknown> {
    title: string;
    description?: string;

    // Simplified action buttons
    addButton?: AddButtonConfig;
    actionButtons?: ActionButtonConfig;

    // Or use custom actions (old way)
    actions?: ReactNode;

    // Search configuration
    enableSearch?: boolean; // Enable automatic search bar (default: false)
    searchPlaceholder?: string;
    onSearch?: (value: string) => void; // Optional callback for custom search logic
    columns: Column<T>[];

    // NEW! Resource-based fetching (pass resource path like "posts", "comments")
    resourcePath?: string; // e.g., "/posts" or "/comments"

    // NEW! Use external API (like NEXT_PUBLIC_SETTINGS_API_URL)
    useExternalAPI?: boolean; // If true, uses NEXT_PUBLIC_SETTINGS_API_URL
    externalAPIBaseURL?: string; // Custom base URL (overrides useExternalAPI)

    // NEW! Auto-mapping: pass raw data array or API response
    // Supports: T[], { data: T[] }, or { data: { data: T[] } }
    data?: DataExtractor<T>;
    /**
     * Field to use as React key (default: "id")
     * IntelliSense will suggest keys from your data type T
     */
    keyField?: T extends object ? keyof T & string : string;
    /**
     * Field to use as id for actions (default: "id")
     * IntelliSense will suggest keys from your data type T
     */
    idField?: T extends object ? keyof T & string : string;
    /**
     * Field to use in delete confirmation (default: "name")
     * IntelliSense will suggest keys from your data type T
     */
    nameField?: T extends object ? keyof T & string : string;

    // Or manually provide rows (old way)
    rows?: Row[];

    loading?: boolean;
    empty?: ReactNode;
    isError?: boolean;
    error?: { message?: string } | Error | null;
    onOptionsClick?: () => void | ReactNode;
    optionsMenu?: OptionsMenuItem[];
    pageSize?: number;
    showPagination?: boolean;
    isMobile?: boolean;

    // External pagination control (optional)
    totalCount?: number; // Total number of items (for server-side pagination)
    currentPage?: number; // Controlled page number
    onPageChange?: (page: number) => void; // Controlled page change handler

    // Delete confirmation
    deleteConfirmTitle?: string;
    deleteConfirmMessage?: (item: T) => string;
    onDelete?: (id: string) => Promise<void> | void; // NEW! Delete handler

    // NEW! Server-side processing options
    serverSide?: boolean;
    paginationType?: "page" | "offset"; // "page" -> page=1, "offset" -> offset=0
    searchParamName?: string; // default "q" or "query"
    pageParamName?: string; // default "page"
    limitParamName?: string; // default "limit"
    offsetParamName?: string; // default "offset"

    // NEW! Auto-generated actions
    enableCreate?: boolean; // default: true (if resourcePath is set)
    enableShow?: boolean; // default: true (if resourcePath is set)
    enableEdit?: boolean; // default: false
    enableDelete?: boolean; // default: true (if resourcePath is set)
    basePath?: string; // overrides resourcePath for routing

    // NEW! Clickable row feature
    onRowClick?: (item: T, id: string) => void; // Custom row click handler (overrides auto-generated)
    enableRowClick?: boolean; // Enable/disable row click (default: true if enableShow is true)

    // NEW! Bulk Actions / Multi-Selection
    selectionMode?: "none" | "single" | "multiple"; // Selection mode (default: "none")
    selectedKeys?: Selection; // Controlled selection state
    onSelectionChange?: (keys: Selection) => void; // Selection change handler
    bulkActions?: BulkAction<T>[]; // Bulk action configurations with typed items
    onBulkDelete?: (ids: string[], items: T[]) => Promise<void> | void; // Shortcut for bulk delete
    bulkDeleteConfirmTitle?: string; // Bulk delete confirmation title
    bulkDeleteConfirmMessage?: (count: number) => string; // Bulk delete confirmation message

    // NEW! Column Visibility
    enableColumnVisibility?: boolean; // Enable column visibility toggle (default: false)
    defaultVisibleColumns?: string[]; // Default visible column keys (default: all columns)
    onVisibleColumnsChange?: (columns: string[]) => void; // Callback when visible columns change
    columnVisibilityStorageKey?: string; // localStorage key for persisting column visibility

    // NEW! Additional Toolbar Options
    enableExport?: boolean;
    onExport?: () => void;
    enableImport?: boolean;
    onImport?: () => void;
    exportResourcePath?: string;
    additionalOptions?: OptionsMenuItem[];
    customOptions?: OptionsMenuItem[];

    // NEW! Rows per page options
    rowsPerPageOptions?: number[];
    onPageSizeChange?: (size: number) => void;

    // NEW! Filtering
    filters?: Array<{
        key: string;
        label: string;
        type: "select" | "text";
        options?: Array<{ label: string; value: string }>;
        placeholder?: string;
    }>;
    onFilterChange?: (filters: Record<string, string>) => void;
    filterValues?: Record<string, string>;
}
