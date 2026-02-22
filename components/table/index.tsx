"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Checkbox,
  Chip,
  Selection,
} from "@heroui/react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";

import SearchBar from "@/components/search-bar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ConfirmDialog } from "@/components/confirmation-dialog";
import { SkeletonTable } from "@/components/skeletons/SkeletonTable";
import { Toast } from "@/components/toast";

import {
  createActionButtons,
  createAddButton,
  createAddButtonFromConfig,
  AddButtonConfig,
  ActionButtonConfig,
  ACTION_BUTTONS,
  ADD_BUTTON,
} from "@/components/button/ActionButtons";
import { StateMessage } from "@/components/state-message";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
// import { LoadingScreen } from "./Loading/LoadingScreen";

// ==================== RESOURCE CONFIGURATION ====================
const RESOURCE_CONFIG: Record<
  string,
  { keyField?: string; idField?: string; nameField?: string }
> = {
  "/blog-cms/posts": { keyField: "id", idField: "id", nameField: "title" },
};

// ==================== TYPE DEFINITIONS ====================

/**
 * Extract keys from a type T that have primitive values (string | number | boolean)
 * This helps with IntelliSense when defining column keys
 */
type PrimitiveKeys<T> = {
  [K in keyof T]: T[K] extends string | number | boolean | null | undefined
    ? K
    : never;
}[keyof T];

/**
 * Extract all keys from a type T (including nested objects)
 * Useful for column key suggestions
 */
type AllKeys<T> = T extends object ? keyof T : never;

/**
 * Column definition with strict typing
 * @template T - The data item type
 * @template K - Optional: Specific key constraint (defaults to keyof T | string for flexibility)
 */
interface Column<T = unknown, K extends string = string> {
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
interface BulkAction<T = unknown> {
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
interface TypedRow<T = unknown> {
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
interface Row {
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
type DataExtractor<T> =
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

interface ListGridProps<T = unknown> {
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

export function ListGrid<T = unknown>({
  title,
  description,

  addButton,
  actionButtons,
  actions: customActions,
  enableSearch = false,
  searchPlaceholder = "Cari...",
  onSearch,
  columns,
  resourcePath,
  useExternalAPI = false,
  externalAPIBaseURL,
  isError,
  error,
  data,
  keyField: keyFieldProp,
  idField: idFieldProp,
  nameField: nameFieldProp,
  rows: manualRows,
  loading = false,
  empty,
  onOptionsClick,
  onDelete,
  optionsMenu = [],
  pageSize = 10,
  showPagination = true,
  isMobile: isMobileProp,
  totalCount: externalTotalCount,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  deleteConfirmTitle = "Confirm Delete",
  deleteConfirmMessage = (item: T) =>
    `Are you sure you want to delete "${
      (item as { name?: string })?.name || "this item"
    }"?`,
  serverSide = false,
  paginationType = "offset",
  searchParamName = "query",
  pageParamName = "page",
  limitParamName = "limit",
  offsetParamName = "offset",
  enableCreate = true,
  enableShow = true,
  enableEdit = false, // Edit is often more complex/optional
  enableDelete = true,
  basePath,
  onRowClick,
  enableRowClick,
  // Bulk Actions / Multi-Selection
  selectionMode = "none",
  selectedKeys: controlledSelectedKeys,
  onSelectionChange: controlledOnSelectionChange,
  bulkActions = [],
  onBulkDelete,
  bulkDeleteConfirmTitle = "Confirm Bulk Delete",
  bulkDeleteConfirmMessage = (count: number) =>
    `Are you sure you want to delete ${count} selected items?`,
  // Column Visibility
  enableColumnVisibility = false,
  defaultVisibleColumns,
  onVisibleColumnsChange,
  columnVisibilityStorageKey,
  // Additional Toolbar Options
  enableExport = false,
  onExport,
  enableImport = false,
  onImport,
  exportResourcePath,
  customOptions = [],
  rowsPerPageOptions = [10, 20, 50, 100],
  onPageSizeChange,
  filters: filterConfigs = [],
  onFilterChange: externalOnFilterChange,
  filterValues: externalFilterValues,
}: ListGridProps<T>) {
  // Apply defaults based on resourcePath if available, otherwise fall back to standard defaults
  const resourceDefaults =
    resourcePath && RESOURCE_CONFIG[resourcePath]
      ? RESOURCE_CONFIG[resourcePath]
      : {};

  const keyField = (keyFieldProp ??
    resourceDefaults.keyField ??
    "id") as T extends object ? keyof T & string : string;
  const idField = (idFieldProp ??
    resourceDefaults.idField ??
    "id") as T extends object ? keyof T & string : string;
  const nameField = (nameFieldProp ??
    resourceDefaults.nameField ??
    "name") as T extends object ? keyof T & string : string;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  const [internalFilterValues, setInternalFilterValues] = useState<
    Record<string, string>
  >({});

  const activeFilters = externalFilterValues ?? internalFilterValues;
  const onFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!externalFilterValues) {
      setInternalFilterValues(newFilters);
    }
    externalOnFilterChange?.(newFilters);
    onPageChange(1); // Reset to first page on filter change
  };
  useEffect(() => {
    setInternalPageSize(pageSize);
  }, [pageSize]);

  // Selection state (for bulk actions)
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Selection>(
    new Set([]),
  );
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
  const onSelectionChange =
    controlledOnSelectionChange ?? setInternalSelectedKeys;

  // Bulk delete confirmation state
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] =
    useState<BulkAction<T> | null>(null);

  // Column visibility state
  const getInitialVisibleColumns = useCallback(() => {
    // Try to load from localStorage if key is provided
    if (columnVisibilityStorageKey && typeof window !== "undefined") {
      const stored = localStorage.getItem(columnVisibilityStorageKey);
      if (stored) {
        try {
          return new Set(JSON.parse(stored) as string[]);
        } catch {
          // Invalid JSON, fall through to default
        }
      }
    }

    // Use defaultVisibleColumns if provided
    if (defaultVisibleColumns) {
      return new Set(defaultVisibleColumns);
    }

    // Default: all columns visible (except those with defaultVisible: false)
    return new Set(
      columns
        .filter((col) => col.defaultVisible !== false)
        .map((col) => col.key),
    );
  }, [columnVisibilityStorageKey, defaultVisibleColumns, columns]);

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    getInitialVisibleColumns,
  );

  // Use external or internal pagination state
  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const onPageChange = externalOnPageChange ?? setInternalCurrentPage;

  // Debounce search query for server-side fetching
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (serverSide) {
        onPageChange(1); // Reset to first page on search
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, serverSide, onPageChange]);

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    item: Row;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use card view for mobile and tablet devices (up to 1024px)
  const isMobileDevice = useMediaQuery("(max-width: 1024px)");
  const isMobile = isMobileProp ?? isMobileDevice;
  const queryClient = useQueryClient();

  // Determine API base URL
  const getAPIBaseURL = () => {
    if (externalAPIBaseURL) {
      return externalAPIBaseURL;
    }
    if (useExternalAPI) {
      return process.env.NEXT_PUBLIC_SETTINGS_API_URL || "";
    }
    return ""; // Default: use apiClient's base URL
  };

  const apiBaseURL = getAPIBaseURL();

  // NEW! Auto-fetch data if resourcePath is provided
  const {
    data: fetchedData,
    isLoading: isFetching,
    isError: isFetchError,
    error: fetchError,
  } = useQuery({
    queryKey: [
      resourcePath,
      apiBaseURL,
      serverSide
        ? {
            page: currentPage,
            size: internalPageSize,
            q: debouncedSearchQuery,
            filters: activeFilters,
          }
        : null,
    ],
    queryFn: async () => {
      if (!resourcePath) return null;

      const fullURL = apiBaseURL
        ? `${apiBaseURL}${resourcePath}`
        : resourcePath;

      const params: Record<string, string | number | undefined> = {};

      if (serverSide) {
        if (debouncedSearchQuery) {
          params[searchParamName] = debouncedSearchQuery;
        }

        params[limitParamName] = internalPageSize;

        if (paginationType === "page") {
          params[pageParamName] = currentPage;
        } else {
          params[offsetParamName] = (currentPage - 1) * internalPageSize;
        }

        // Add filters to params
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value && value !== "all") {
            params[key] = value;
          }
        });
      }

      const { data } = await apiClient.get<ApiResponse<T[]>>(fullURL, {
        params,
      });
      return data;
    },
    enabled: !!resourcePath && !data, // Only fetch if resourcePath provided and no data prop
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });

  // Use fetched data if available, otherwise use provided data
  const actualData = data || fetchedData;
  const actualLoading = loading || isFetching;
  const actualError = isError || isFetchError;
  const actualErrorObj = error || fetchError;

  // Helper: Extract array from API response
  const extractDataArray = (input: DataExtractor<T> | undefined): T[] => {
    if (!input) return [];

    // Case 1: Already an array
    if (Array.isArray(input)) {
      return input;
    }

    // Case 2: { data: T[] } or { data?: T[] } or { data: { data: T[] } }
    if ("data" in input) {
      const nested = input.data;

      // Case 2a: data is undefined or null
      if (!nested) {
        return [];
      }

      // Case 2b: { data: T[] }
      if (Array.isArray(nested)) {
        return nested;
      }

      // Case 2c: { data: { data: T[] } } or { data: { data?: T[] } }
      if (typeof nested === "object" && "data" in nested) {
        const deepNested = (nested as { data?: unknown }).data;

        if (!deepNested) {
          return [];
        }

        if (Array.isArray(deepNested)) {
          return deepNested as T[];
        }
      }
    }

    return [];
  };

  // Auto-transform data to rows if data prop is provided
  // Using TypedRow<T> for better type safety
  const rows = useMemo((): TypedRow<T>[] | Row[] => {
    if (actualData) {
      // Extract array from various API response formats
      const dataArray = extractDataArray(actualData);

      // Automatically map data array to typed rows
      return dataArray.map((item): TypedRow<T> => {
        // Use type assertion with proper constraint
        const record = item as T & Record<string, unknown>;

        // Safely access fields with type guards
        const getFieldValue = (field: string): string => {
          const value = record[field as keyof typeof record];
          if (value === null || value === undefined) return "";
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            return String(value);
          }
          return "";
        };

        return {
          key: getFieldValue(keyField),
          id: getFieldValue(idField),
          name: getFieldValue(nameField),
          _originalItem: item, // Preserve original typed item
          // Spread primitive values for direct table cell access
          ...(Object.fromEntries(
            Object.entries(record).filter(
              ([, v]) =>
                typeof v === "string" ||
                typeof v === "number" ||
                typeof v === "boolean" ||
                v === null ||
                v === undefined,
            ),
          ) as Record<string, string | number | boolean | undefined>),
        };
      });
    }

    // Use manually provided rows (legacy support)
    return manualRows ?? [];
  }, [actualData, manualRows, keyField, idField, nameField]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    onPageChange(1);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: string, item: Row) => {
    setItemToDelete({ id, item });
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      if (onDelete) {
        // Use provided delete handler
        await onDelete(itemToDelete.id);
      } else if (actionButtons?.delete) {
        // Use actionButtons delete handler
        await actionButtons.delete.onDelete(itemToDelete.id, itemToDelete.item);
      } else if (resourcePath) {
        // Use auto-delete via API
        const fullURL = apiBaseURL
          ? `${apiBaseURL}${resourcePath}/${itemToDelete.id}`
          : `${resourcePath}/${itemToDelete.id}`;

        await apiClient.delete(fullURL);
      }

      // Refetch data after successful delete
      if (resourcePath) {
        await queryClient.invalidateQueries({
          queryKey: [resourcePath, apiBaseURL],
        });
      }

      Toast({
        title: "Success",
        description: `${itemToDelete.item.name || "Item"} successfully deleted`,
        color: "success",
      });

      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the item";
      Toast({
        title: "Failed to Delete",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ==================== BULK ACTIONS ====================

  // Get selected items from selectedKeys
  const getSelectedItems = useCallback(() => {
    if (selectedKeys === "all") {
      return rows;
    }
    const selectedSet = selectedKeys as Set<string>;
    return rows.filter((row) => selectedSet.has(row.key));
  }, [selectedKeys, rows]);

  // Get selected IDs from selectedKeys
  const getSelectedIds = useCallback(() => {
    if (selectedKeys === "all") {
      return rows.map((row) => String(row.id || row.key));
    }
    const selectedSet = selectedKeys as Set<string>;
    return rows
      .filter((row) => selectedSet.has(row.key))
      .map((row) => String(row.id || row.key));
  }, [selectedKeys, rows]);

  // Count of selected items
  const selectedCount = useMemo(() => {
    if (selectedKeys === "all") {
      return rows.length;
    }
    return (selectedKeys as Set<string>).size;
  }, [selectedKeys, rows.length]);

  // Handle bulk action click (with optional confirmation)
  const handleBulkActionClick = (action: BulkAction<T>) => {
    if (action.confirmTitle || action.confirmMessage) {
      setPendingBulkAction(action);
      setIsBulkDeleteDialogOpen(true);
    } else {
      executeBulkAction(action);
    }
  };

  // Execute bulk action
  const executeBulkAction = async (action: BulkAction<T>) => {
    const selectedIds = getSelectedIds();
    const selectedItems = getSelectedItems();

    setIsBulkDeleting(true);
    try {
      // Extract original typed items for the action handler
      const typedItems = selectedItems.map(
        (item) => (item._originalItem ?? item) as T,
      );
      await action.onAction(selectedIds, typedItems);

      // Clear selection after successful action
      onSelectionChange(new Set([]));

      // Refetch data if resourcePath is set
      if (resourcePath) {
        await queryClient.invalidateQueries({
          queryKey: [resourcePath, apiBaseURL],
        });
      }

      Toast({
        title: "Success",
        description: `Action "${action.label}" executed successfully`,
        color: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while executing bulk action";
      Toast({
        title: "Action Failed",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setIsBulkDeleting(false);
      setIsBulkDeleteDialogOpen(false);
      setPendingBulkAction(null);
    }
  };

  // Handle bulk delete (shortcut)
  const handleBulkDelete = async () => {
    const selectedIds = getSelectedIds();
    const selectedItems = getSelectedItems();

    setIsBulkDeleting(true);
    try {
      if (onBulkDelete) {
        await onBulkDelete(
          selectedIds,
          selectedItems.map((item) => (item._originalItem || item) as T),
        );
      } else if (resourcePath) {
        // Auto bulk delete via API (delete one by one)
        for (const id of selectedIds) {
          const fullURL = apiBaseURL
            ? `${apiBaseURL}${resourcePath}/${id}`
            : `${resourcePath}/${id}`;
          await apiClient.delete(fullURL);
        }
      }

      // Clear selection after successful delete
      onSelectionChange(new Set([]));

      // Refetch data
      if (resourcePath) {
        await queryClient.invalidateQueries({
          queryKey: [resourcePath, apiBaseURL],
        });
      }

      Toast({
        title: "Success",
        description: `${selectedIds.length} items successfully deleted`,
        color: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting selected items";
      Toast({
        title: "Failed to Delete",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setIsBulkDeleting(false);
      setIsBulkDeleteDialogOpen(false);
      setPendingBulkAction(null);
    }
  };

  // ==================== COLUMN VISIBILITY ====================

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        // Don't allow hiding if it's the last visible column
        if (newSet.size > 1) {
          newSet.delete(columnKey);
        }
      } else {
        newSet.add(columnKey);
      }

      // Persist to localStorage if key is provided
      if (columnVisibilityStorageKey && typeof window !== "undefined") {
        localStorage.setItem(
          columnVisibilityStorageKey,
          JSON.stringify(Array.from(newSet)),
        );
      }

      // Callback
      onVisibleColumnsChange?.(Array.from(newSet));

      return newSet;
    });
  };

  // Show all columns
  const showAllColumns = () => {
    const allColumns = new Set(columns.map((col) => col.key));
    setVisibleColumns(allColumns);

    if (columnVisibilityStorageKey && typeof window !== "undefined") {
      localStorage.setItem(
        columnVisibilityStorageKey,
        JSON.stringify(Array.from(allColumns)),
      );
    }

    onVisibleColumnsChange?.(Array.from(allColumns));
  };

  // Filter columns by visibility and auto-inject actions column if needed
  const filteredColumns = useMemo(() => {
    let cols = enableColumnVisibility
      ? columns.filter((col) => visibleColumns.has(col.key))
      : columns;

    // Auto-inject actions column if any action is enabled and column doesn't exist
    const hasActionsColumn = cols.some((col) => col.key === "actions");
    const hasAnyAction = enableShow || enableEdit || enableDelete;

    if (!hasActionsColumn && hasAnyAction) {
      cols = [
        ...cols,
        {
          key: "actions",
          label: "Actions",
          align: "center" as const,
          hideable: false,
        },
      ];
    }

    return cols;
  }, [
    columns,
    visibleColumns,
    enableColumnVisibility,
    enableShow,
    enableEdit,
    enableDelete,
  ]);

  // Hideable columns (for the dropdown)
  const hideableColumns = useMemo(() => {
    return columns.filter(
      (col) => col.hideable !== false && col.key !== "actions",
    );
  }, [columns]);

  // Get Next.js router for auto-routing
  const router = useRouter();

  // Process action buttons to convert auto-route handlers to router.push
  const processedActionButtons = useMemo(() => {
    if (!actionButtons) return null;

    const processed = { ...actionButtons };

    // Import helper functions
    const isAutoRouteHandler = (handler: unknown): boolean => {
      return (
        typeof handler === "function" &&
        "__autoRoute" in handler &&
        (handler as { __autoRoute?: unknown }).__autoRoute !== undefined
      );
    };

    const getAutoRoute = (
      handler: { __autoRoute: { basePath: string; suffix?: string } },
      id: string,
    ): string => {
      const { basePath, suffix } = handler.__autoRoute;
      const normalizedBase = basePath.replace(/\/$/, "");
      return suffix
        ? `${normalizedBase}/${id}${suffix}`
        : `${normalizedBase}/${id}`;
    };

    // Process show button
    if (processed.show?.onClick && isAutoRouteHandler(processed.show.onClick)) {
      const originalHandler = processed.show.onClick as unknown as {
        __autoRoute: { basePath: string; suffix?: string };
      };
      processed.show = {
        ...processed.show,
        onClick: (id: string) => {
          const route = getAutoRoute(originalHandler, id);
          router.push(route);
        },
      };
    }

    // Process edit button
    if (processed.edit?.onClick && isAutoRouteHandler(processed.edit.onClick)) {
      const originalHandler = processed.edit.onClick as unknown as {
        __autoRoute: { basePath: string; suffix?: string };
      };
      processed.edit = {
        ...processed.edit,
        onClick: (id: string) => {
          const route = getAutoRoute(originalHandler, id);
          router.push(route);
        },
      };
    }

    return processed;
  }, [actionButtons, router]);

  // Merge explicitly provided actionButtons with auto-generated ones
  const finalActionButtons = useMemo(() => {
    // If no resourcePath, just return processedActionButtons (manual mode)
    if (!resourcePath) return processedActionButtons;

    const routeBase = basePath || resourcePath;

    // Start with empty config or existing processed config
    const merged = processedActionButtons ? { ...processedActionButtons } : {};

    // Auto-generate CREATE
    if (enableCreate && !merged.add && !addButton) {
      merged.add = ADD_BUTTON.CREATE(`${routeBase}/create`);
    }

    // Auto-generate SHOW
    if (enableShow && !merged.show) {
      merged.show = ACTION_BUTTONS.SHOW((id) =>
        router.push(`${routeBase}/${id}`),
      );
    }

    // Auto-generate EDIT
    if (enableEdit && !merged.edit) {
      merged.edit = ACTION_BUTTONS.EDIT((id) =>
        router.push(`${routeBase}/${id}/edit`),
      );
    }

    // Auto-generate DELETE
    if (enableDelete && !merged.delete) {
      // For delete, we rely on the ListGrid's internal handleDeleteConfirm which checks resourcePath
      // But we need to put a placeholder here so the button renders
      merged.delete = ACTION_BUTTONS.DELETE(() => {
        // This is a dummy handler. The real logic is in handleDeleteConfirm
        // which checks if (onDelete) ... else if (actionButtons.delete.onDelete) ... else if (resourcePath)
        // However, the actionButtons type requires onDelete.
        // We'll provide a no-op here, knowing handleDeleteConfirm will handle it if resourcePath is set.
      });
    }

    return merged;
  }, [
    processedActionButtons,
    resourcePath,
    basePath,
    enableCreate,
    enableShow,
    enableEdit,
    enableDelete,
    router,
    addButton,
  ]);

  // Determine if row click is enabled and create handler
  const isRowClickEnabled = useMemo(() => {
    // If explicitly set, use that value
    if (enableRowClick !== undefined) return enableRowClick;
    // Auto-enable if custom onRowClick is provided
    if (onRowClick) return true;
    // Auto-enable if enableShow is true and we have a resourcePath or show action
    if (enableShow && (resourcePath || finalActionButtons?.show)) return true;
    return false;
  }, [
    enableRowClick,
    onRowClick,
    enableShow,
    resourcePath,
    finalActionButtons?.show,
  ]);

  // Row click handler
  const handleRowClick = useMemo(() => {
    if (!isRowClickEnabled) return null;

    return (row: Row) => {
      const id = String(row.id || row.key);
      const originalItem = (row._originalItem || row) as T;

      // Use custom handler if provided
      if (onRowClick) {
        onRowClick(originalItem, id);
        return;
      }

      // Use show action button's onClick if available
      if (finalActionButtons?.show?.onClick) {
        finalActionButtons.show.onClick(id);
        return;
      }

      // Auto-navigate to detail page if resourcePath is set
      if (resourcePath) {
        const routeBase = basePath || resourcePath;
        router.push(`${routeBase}/${id}`);
      }
    };
  }, [
    isRowClickEnabled,
    onRowClick,
    finalActionButtons?.show,
    resourcePath,
    basePath,
    router,
  ]);

  // Create action buttons renderer
  const renderActions = useMemo(() => {
    if (finalActionButtons) {
      return createActionButtons(
        finalActionButtons,
        openDeleteDialog as (id: string, item: unknown) => void,
      );
    }
    return null;
  }, [finalActionButtons]);

  // Create add button (support both old and new way)
  const renderAddButton = useMemo(() => {
    // New way: from finalActionButtons.add
    if (finalActionButtons?.add) {
      return createAddButtonFromConfig(finalActionButtons);
    }

    // Old way: from separate addButton prop (deprecated)
    if (addButton) {
      return createAddButton(addButton);
    }

    return null;
  }, [finalActionButtons, addButton]);

  // Transform rows to include column values and actions
  const transformedRows = useMemo(() => {
    return rows.map((row) => {
      const transformedRow: Record<string, ReactNode | T> = { ...row };

      // Apply column value functions if defined
      columns.forEach((column) => {
        if (column.value && column.key !== "actions") {
          // Pass _originalItem to preserve nested objects (author, categories, etc)
          const originalItem = (row as TypedRow<T>)._originalItem || (row as T);
          transformedRow[column.key] = column.value(originalItem);
        }
      });

      // Add action buttons if configured
      if (renderActions) {
        transformedRow.actions = renderActions(row as never);
      }

      return transformedRow;
    });
  }, [rows, columns, renderActions]);

  const filteredRows = useMemo(() => {
    let filtered = [...transformedRows];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      filtered = filtered.filter((row) =>
        Object.values(row).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(q),
        ),
      );
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey]?.toString().toLowerCase() ?? "";
        const valB = b[sortKey]?.toString().toLowerCase() ?? "";

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;

        return 0;
      });
    }

    return filtered;
  }, [transformedRows, searchQuery, sortKey, sortDirection]);

  // Use external totalCount if provided (for server-side pagination), otherwise calculate from filtered rows
  // Or if fetched data has totalCount
  const fetchedTotalCount = (fetchedData as { totalCount?: number })
    ?.totalCount;

  const totalPages =
    (externalTotalCount ?? fetchedTotalCount)
      ? Math.ceil(
          (externalTotalCount ?? fetchedTotalCount ?? 0) / internalPageSize,
        )
      : Math.ceil(filteredRows.length / internalPageSize);

  const paginatedRows = useMemo(() => {
    // If using external pagination (server-side) or serverSide prop is true, don't slice - data is already paginated
    if (externalTotalCount !== undefined || serverSide) {
      return filteredRows;
    }

    // Client-side pagination
    const startIndex = (currentPage - 1) * internalPageSize;
    return filteredRows.slice(startIndex, startIndex + internalPageSize);
  }, [
    filteredRows,
    currentPage,
    internalPageSize,
    externalTotalCount,
    serverSide,
  ]);

  useEffect(() => {
    // Only reset page if not externally controlled and not server-side
    // For server-side, row changes are expected when changing pages, so we shouldn't reset
    if (!externalOnPageChange && !serverSide) {
      setInternalCurrentPage(1);
    }
  }, [searchQuery, rows, externalOnPageChange, serverSide]);

  const renderMobileCard = (item: Row) => {
    const mobileColumns = filteredColumns.filter(
      (col) => col.key !== "actions",
    );

    return (
      <div
        key={item.key}
        className={`relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${
          handleRowClick ? "cursor-pointer" : ""
        }`}
        onClick={() => handleRowClick?.(item)}
        role={handleRowClick ? "button" : undefined}
        tabIndex={handleRowClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (handleRowClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleRowClick(item);
          }
        }}
      >
        {/* Selection checkbox for mobile */}
        {renderMobileSelectionCheckbox(item)}

        {/* Colored top border */}
        <div className="h-1 bg-linear-to-r from-gray-500 to-gray-900" />

        <div className="p-4 space-y-3">
          {mobileColumns.map((column, columnIndex) => (
            <div
              key={`${item.key}-${column.key}`}
              className={`flex flex-col ${
                columnIndex !== mobileColumns.length - 1
                  ? "pb-3 border-b border-gray-100 dark:border-gray-800"
                  : ""
              }`}
            >
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {column.label}
              </div>
              <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                {typeof item[column.key] === "object" &&
                item[column.key] !== null
                  ? item[column.key]
                  : getKeyValue(item, column.key) || "-"}
              </div>
            </div>
          ))}

          {/* Actions for mobile */}
          {item.actions && (
            <div
              className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {item.actions}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMobileSkeleton = () => {
    const skeletonColumns = filteredColumns.filter(
      (col) => col.key !== "actions",
    );

    return (
      <div className="space-y-4">
        {Array.from({ length: internalPageSize }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="h-1 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="p-4 space-y-3">
              {skeletonColumns.map((_, columnIndex) => (
                <div
                  key={columnIndex}
                  className={`${
                    columnIndex !== skeletonColumns.length - 1
                      ? "pb-3 border-b border-gray-100 dark:border-gray-800"
                      : ""
                  }`}
                >
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOptionsMenu = () => {
    // Combine default options with custom options
    const allOptions: OptionsMenuItem[] = optionsMenu ? [...optionsMenu] : [];

    if (customOptions && customOptions.length > 0) {
      allOptions.push(...customOptions);
    }

    if (enableImport) {
      allOptions.unshift({
        key: "import",
        label: "Import",
        icon: <Icon icon="lucide:upload" className="w-6 h-6" />,
        onPress:
          onImport ||
          (() => {
            const targetPath = exportResourcePath || resourcePath;
            if (targetPath) {
              const resource = targetPath.replace(/^\//, "");
              router.push(`/${resource}/import`);
            } else {
              Toast({
                title: "Error",
                description:
                  "Resource path tidak konfigurasikan untuk auto-import",
                color: "danger",
              });
            }
          }),
      });
    }

    if (enableExport) {
      allOptions.unshift({
        key: "export",
        label: "Export",
        icon: <Icon icon="lucide:download" className="w-6 h-6" />,
        onPress:
          onExport ||
          (async () => {
            const targetPath = exportResourcePath || resourcePath;
            if (!targetPath) {
              Toast({
                title: "Error",
                description: "Resource path tidak ditemukan untuk auto-export",
                color: "danger",
              });
              return;
            }
            try {
              Toast({
                title: "Processing",
                description: "Mempersiapkan data export...",
                color: "primary",
              });

              const response = await fetch(`/api/export${targetPath}`);

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                  errorData.message || "Gagal melakukan export data",
                );
              }

              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              const fileName = `${targetPath.replace(/^\//, "")}-export-${new Date().toISOString().split("T")[0]}.csv`;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);

              Toast({
                title: "Success",
                description: "Data berhasil diexport",
                color: "success",
              });
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Terjadi kesalahan saat export";
              Toast({
                title: "Error",
                description: errorMessage,
                color: "danger",
              });
            }
          }),
      });
    }

    if (allOptions.length === 0) return null;

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly size="lg" variant="light">
            <Icon icon="lucide:ellipsis-vertical" className="w-6 h-6" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Options menu"
          onAction={(key) => {
            const menuItem = allOptions.find((item) => item.key === key);

            if (menuItem && menuItem.onPress) {
              menuItem.onPress();
            }
          }}
        >
          {allOptions.map((item) => (
            <DropdownItem
              key={item.key}
              color={item.color}
              startContent={item.icon}
              variant={item.variant}
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  };

  // ==================== FILTERS RENDERER ====================
  const renderFilters = () => {
    if (filterConfigs.length === 0) return null;

    const activeFilterCount = Object.values(activeFilters).filter(
      (v) => v && v !== "" && v !== "all",
    ).length;

    const handleClearAllFilters = () => {
      const cleared: Record<string, string> = {};
      filterConfigs.forEach((f) => (cleared[f.key] = ""));
      if (!externalFilterValues) {
        setInternalFilterValues(cleared);
      }
      externalOnFilterChange?.(cleared);
      onPageChange(1);
    };

    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Button
            isIconOnly
            size="lg"
            variant="light"
            className="relative overflow-visible"
          >
            <Icon icon="lucide:filter" className="w-6 h-6" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-52">
          <div className="max-h-64 overflow-y-auto w-full">
            {activeFilterCount > 0 && (
              <div className="sticky top-0 bg-white dark:bg-default-100 border-b border-default-200 z-10">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                  onClick={handleClearAllFilters}
                >
                  <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                  Clear all filters
                </button>
              </div>
            )}
            {filterConfigs.map((filter, index) => (
              <div
                key={filter.key}
                className={
                  index < filterConfigs.length - 1
                    ? "border-b border-default-200"
                    : ""
                }
              >
                <div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold text-default-500 uppercase tracking-wider">
                  {filter.label}
                </div>
                {[
                  { label: "All", value: "" },
                  ...(filter.options || []),
                ].map((opt) => {
                  const isActive =
                    opt.value === ""
                      ? !activeFilters[filter.key] ||
                        activeFilters[filter.key] === ""
                      : activeFilters[filter.key] === opt.value;
                  return (
                    <button
                      key={opt.value || "__all__"}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "text-primary bg-primary-50 dark:bg-primary-900/20"
                          : "text-default-700 hover:bg-default-100 dark:hover:bg-default-800"
                      }`}
                      onClick={() => onFilterChange(filter.key, opt.value)}
                    >
                      {opt.label}
                      {isActive && (
                        <Icon
                          icon="lucide:check"
                          className="w-3.5 h-3.5 text-primary shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
                <div className="pb-1" />
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // ==================== COLUMN VISIBILITY DROPDOWN ====================
  const renderColumnVisibilityDropdown = () => {
    if (!enableColumnVisibility || hideableColumns.length === 0) return null;

    const hiddenCount =
      hideableColumns.length -
      visibleColumns.size +
      (visibleColumns.has("actions") ? 1 : 0);

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button
            size="lg"
            variant="flat"
            startContent={<Icon icon="lucide:columns-3" className="w-6 h-6" />}
          >
            Kolom
            {hiddenCount > 0 && (
              <Chip size="sm" color="primary" variant="flat" className="ml-1">
                {hiddenCount} tersembunyi
              </Chip>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Column visibility"
          closeOnSelect={false}
          selectionMode="multiple"
          selectedKeys={visibleColumns}
          onSelectionChange={(keys) => {
            const newKeys = keys as Set<string>;
            // Ensure at least one column remains visible
            if (newKeys.size > 0) {
              setVisibleColumns(newKeys);
              if (columnVisibilityStorageKey && typeof window !== "undefined") {
                localStorage.setItem(
                  columnVisibilityStorageKey,
                  JSON.stringify(Array.from(newKeys)),
                );
              }
              onVisibleColumnsChange?.(Array.from(newKeys));
            }
          }}
        >
          {hideableColumns.map((col) => (
            <DropdownItem key={col.key}>
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={visibleColumns.has(col.key)}
                  size="sm"
                  onValueChange={() => toggleColumnVisibility(col.key)}
                />
                <span>{col.label}</span>
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  };

  // ==================== ROWS PER PAGE SELECTOR ====================
  const renderRowsPerPageSelector = () => {
    if (!rowsPerPageOptions || rowsPerPageOptions.length === 0) return null;

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 whitespace-nowrap">Rows:</span>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="flat" size="md" className="min-w-[80px]">
              {internalPageSize}
              <Icon icon="lucide:chevron-down" className="w-4 h-4 ml-1" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Rows per page"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([internalPageSize.toString()])}
            onSelectionChange={(keys) => {
              const size = Number(Array.from(keys)[0]);
              setInternalPageSize(size);
              onPageSizeChange?.(size);
              onPageChange(1);
            }}
          >
            {rowsPerPageOptions.map((option) => (
              <DropdownItem key={option.toString()}>{option}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  };

  // ==================== BULK ACTIONS BAR ====================
  const renderBulkActionsBar = () => {
    if (selectionMode === "none" || selectedCount === 0) return null;

    // Combine custom bulk actions with auto-generated bulk delete
    const allBulkActions: BulkAction<T>[] = [...bulkActions];

    // Add auto bulk delete if enabled and resourcePath is set
    if (
      (enableDelete || onBulkDelete) &&
      !bulkActions.some((a) => a.key === "delete")
    ) {
      allBulkActions.push({
        key: "delete",
        label: "Hapus Terpilih",
        icon: "lucide:trash-2",
        color: "danger",
        confirmTitle: bulkDeleteConfirmTitle,
        confirmMessage: bulkDeleteConfirmMessage,
        onAction: async (ids, items) => {
          if (onBulkDelete) {
            await onBulkDelete(ids, items as T[]);
          } else if (resourcePath) {
            for (const id of ids) {
              const fullURL = apiBaseURL
                ? `${apiBaseURL}${resourcePath}/${id}`
                : `${resourcePath}/${id}`;
              await apiClient.delete(fullURL);
            }
          }
        },
      });
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat" size="sm">
            {selectedCount} item dipilih
          </Chip>
          <Button
            size="lg"
            variant="light"
            onPress={() => onSelectionChange(new Set([]))}
          >
            Batal Pilih
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {allBulkActions.map((action) => (
            <Button
              key={action.key}
              size="lg"
              color={action.color || "default"}
              variant="flat"
              startContent={
                action.icon ? (
                  <Icon icon={action.icon} className="w-6 h-6" />
                ) : undefined
              }
              onPress={() => handleBulkActionClick(action)}
              isLoading={
                isBulkDeleting && pendingBulkAction?.key === action.key
              }
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // ==================== MOBILE SELECTION CHECKBOX ====================
  const renderMobileSelectionCheckbox = (item: Row) => {
    if (selectionMode === "none") return null;

    const isSelected =
      selectedKeys === "all" || (selectedKeys as Set<string>).has(item.key);

    return (
      <div
        className="absolute top-3 right-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          isSelected={isSelected}
          onValueChange={(checked) => {
            const newSelection = new Set(
              selectedKeys === "all"
                ? rows.map((r) => r.key)
                : (selectedKeys as Set<string>),
            );
            if (checked) {
              newSelection.add(item.key);
            } else {
              newSelection.delete(item.key);
            }
            onSelectionChange(newSelection);
          }}
        />
      </div>
    );
  };

  if (actualError) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <StateMessage
          type="error"
          title="Failed to load Data"
          message={actualErrorObj?.message || "Failed to load data."}
        >
          <Button
            color="danger"
            variant="light"
            onPress={() => window.location.reload()}
          >
            Try Again
          </Button>
        </StateMessage>
      </div>
    );
  }

  return (
    <>
      <LoadingScreen isLoading={actualLoading} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isMobile && renderColumnVisibilityDropdown()}
            {renderFilters()}
            {renderOptionsMenu()}
            {renderAddButton || customActions}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {renderBulkActionsBar()}

        {enableSearch && (
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder={searchPlaceholder}
              onSearch={(val) => {
                setSearchQuery(val);
                onSearch?.(val);
              }}
              defaultValue={searchQuery}
            />
          </div>
        )}

        {actualLoading ? (
          isMobile ? (
            renderMobileSkeleton()
          ) : (
            <>
              <SkeletonTable
                columns={filteredColumns.length}
                rows={internalPageSize}
              />
            </>
          )
        ) : rows.length === 0 ? (
          // CASE: No data available
          <StateMessage
            type="empty"
            title="No data available"
            message=""
            icon="lucide:file-text"
          />
        ) : filteredRows.length === 0 ? (
          (empty ?? (
            <>
              <StateMessage
                type="empty"
                title="No data available"
                message=""
                icon="lucide:file-text"
              />
            </>
          ))
        ) : isMobile ? (
          <div className="space-y-4">
            {/* Responsive grid: 1 column on mobile, 2 columns on tablet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedRows.map((item) => renderMobileCard(item as Row))}
            </div>

            {showPagination && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="flex-1 w-full flex justify-center sm:justify-start overflow-auto">
                  {totalPages > 1 && (
                    <Pagination
                      showControls
                      showShadow
                      classNames={{
                        wrapper: "gap-1",
                        item: "w-8 h-8 text-small",
                        cursor: "font-bold",
                      }}
                      color="primary"
                      page={currentPage}
                      total={totalPages}
                      onChange={onPageChange}
                    />
                  )}
                </div>
                <div className="flex justify-end">
                  {renderRowsPerPageSelector()}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Table
              aria-label="Tabel"
              selectionMode={selectionMode}
              selectedKeys={selectionMode !== "none" ? selectedKeys : undefined}
              onSelectionChange={
                selectionMode !== "none" ? onSelectionChange : undefined
              }
            >
              <TableHeader columns={filteredColumns}>
                {(column) => (
                  <TableColumn
                    key={column.key}
                    align={column.align ?? "start"}
                    className="cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    {sortKey === column.key &&
                      (sortDirection === "asc" ? " ▲" : " ▼")}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={paginatedRows}>
                {(item) => (
                  <TableRow
                    key={String(item.key)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      handleRowClick ? "cursor-pointer" : ""
                    }`}
                    onDoubleClick={() => handleRowClick?.(item as Row)}
                  >
                    {(columnKey) => (
                      <TableCell
                        onClick={(e) => {
                          // Prevent row click when clicking on actions column
                          if (columnKey === "actions") {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {typeof item[columnKey] === "object" &&
                        item[columnKey] !== null
                          ? item[columnKey]
                          : getKeyValue(item, columnKey)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {showPagination && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="flex-1" />
                <div className="flex justify-center">
                  {totalPages > 1 && (
                    <Pagination
                      showControls
                      showShadow
                      classNames={{
                        wrapper: "gap-2",
                        item: "w-8 h-8 text-small",
                        cursor: "font-bold",
                      }}
                      color="primary"
                      page={currentPage}
                      total={totalPages}
                      onChange={onPageChange}
                    />
                  )}
                </div>
                <div className="flex-1 flex justify-end">
                  {renderRowsPerPageSelector()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        confirmLabel="Delete"
        isLoading={isDeleting}
        isOpen={isDeleteDialogOpen}
        message={
          itemToDelete
            ? deleteConfirmMessage(
                (itemToDelete.item._originalItem || itemToDelete.item) as T,
              )
            : "Are you sure?"
        }
        title={deleteConfirmTitle}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete/Action Confirmation Dialog */}
      <ConfirmDialog
        confirmLabel={pendingBulkAction?.label || "Confirm"}
        isLoading={isBulkDeleting}
        isOpen={isBulkDeleteDialogOpen}
        message={
          pendingBulkAction?.confirmMessage
            ? pendingBulkAction.confirmMessage(selectedCount)
            : bulkDeleteConfirmMessage(selectedCount)
        }
        title={pendingBulkAction?.confirmTitle || bulkDeleteConfirmTitle}
        onClose={() => {
          if (!isBulkDeleting) {
            setIsBulkDeleteDialogOpen(false);
            setPendingBulkAction(null);
          }
        }}
        onConfirm={() => {
          if (pendingBulkAction) {
            executeBulkAction(pendingBulkAction);
          } else {
            handleBulkDelete();
          }
        }}
      />
    </>
  );
}

// ==================== TYPE EXPORTS ====================

// Export types for external use
export type { BulkAction, Column, TypedRow, Row, PrimitiveKeys, AllKeys };

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper function to create a type-safe column definition
 * Provides full IntelliSense support for column keys and value functions
 *
 * @template T - Your data item type
 * @param column - Column configuration
 * @returns The same column with proper typing
 *
 * @example
 * interface User {
 *   id: string;
 *   firstName: string;
 *   lastName: string;
 *   email: string;
 *   status: 'active' | 'inactive';
 * }
 *
 * const columns: Columns<User> = [
 *   createColumn<User>({ key: "firstName", label: "First Name" }),
 *   createColumn<User>({
 *     key: "fullName", // Custom computed column
 *     label: "Full Name",
 *     value: (user) => `${user.firstName} ${user.lastName}` // Fully typed!
 *   }),
 *   createColumn<User>({
 *     key: "status",
 *     label: "Status",
 *     value: (user) => (
 *       <Badge color={user.status === 'active' ? 'success' : 'default'}>
 *         {user.status}
 *       </Badge>
 *     )
 *   }),
 * ];
 */
export function createColumn<T>(column: Column<T>): Column<T> {
  return column;
}

/**
 * Helper function to create multiple type-safe columns at once
 *
 * @template T - Your data item type
 * @param columns - Array of column configurations
 * @returns The same columns with proper typing
 *
 * @example
 * const columns = createColumns<User>([
 *   { key: "name", label: "Nama" },
 *   { key: "email", label: "Email" },
 *   { key: "actions", label: "Aksi" },
 * ]);
 */
export function createColumns<T>(columns: Column<T>[]): Column<T>[] {
  return columns;
}

/**
 * Helper function to create a type-safe bulk action
 *
 * @template T - Your data item type
 * @param action - Bulk action configuration
 * @returns The same action with proper typing
 *
 * @example
 * const exportAction = createBulkAction<User>({
 *   key: "export",
 *   label: "Export to CSV",
 *   icon: "lucide:download",
 *   onAction: async (ids, users) => {
 *     // 'users' is typed as User[]!
 *     const csv = users.map(u => `${u.name},${u.email}`).join('\n');
 *     downloadCSV(csv);
 *   }
 * });
 */
export function createBulkAction<T>(action: BulkAction<T>): BulkAction<T> {
  return action;
}
