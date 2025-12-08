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
  Button,
} from "@heroui/react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";

import SearchBar from "@/components/ui/SearchBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ConfirmDialog } from "./Common/ConfirmDialog";
import { SkeletonTable } from "./Skeletons/SkeletonTable";
import { PageHeader } from "./Common/PageHeader";
import {
  createActionButtons,
  createAddButton,
  createAddButtonFromConfig,
  AddButtonConfig,
  ActionButtonConfig,
} from "./Button/ActionButtons";
import { ErrorState } from "./Common/ErrorState";
import EmptyState from "./Common/EmptyState";
import { LoadingScreen } from "./Loading/LoadingScreen";

interface Column<T = unknown> {
  key: string;
  label: string;
  align?: "start" | "center" | "end";
  value?: (item: T) => ReactNode; // Type-safe value renderer
}

// Helper type: Makes defining columns super simple!
// Usage: const columns: Columns<Post> = [...]
export type Columns<T> = Array<{
  key: string;
  label: string;
  align?: "start" | "center" | "end";
  value?: (item: T) => ReactNode;
}>;

interface Row {
  key: string;
  // @ts-expect-error: We know this is unsafe, but it's a tradeoff for type safety
  _originalItem?: unknown; // Store original typed item
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

interface OptionsMenuItem {
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
  breadcrumbs?: { label: string; href?: string }[];
  withoutBreadcrumbs?: boolean;

  // Simplified action buttons
  addButton?: AddButtonConfig;
  actionButtons?: ActionButtonConfig;

  // Or use custom actions (old way)
  actions?: ReactNode;

  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  columns: Column<T>[];

  // NEW! Resource-based fetching (pass resource path like "posts", "comments")
  resourcePath?: string; // e.g., "/posts" or "/comments"

  // NEW! Use external API (like NEXT_PUBLIC_SETTINGS_API_URL)
  useExternalAPI?: boolean; // If true, uses NEXT_PUBLIC_SETTINGS_API_URL
  externalAPIBaseURL?: string; // Custom base URL (overrides useExternalAPI)

  // NEW! Auto-mapping: pass raw data array or API response
  // Supports: T[], { data: T[] }, or { data: { data: T[] } }
  data?: DataExtractor<T>;
  keyField?: string; // Field to use as React key (default: "id")
  idField?: string; // Field to use as id for actions (default: "id")
  nameField?: string; // Field to use in delete confirmation (default: "name")

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
}

export function ListGrid<T = unknown>({
  title,
  description,
  breadcrumbs,
  withoutBreadcrumbs = false,
  addButton,
  actionButtons,
  actions: customActions,
  searchPlaceholder = "Cari...",
  onSearch,
  columns,
  resourcePath,
  useExternalAPI = false,
  externalAPIBaseURL,
  isError,
  error,
  data,
  keyField = "id",
  idField = "id",
  nameField = "name",
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
  deleteConfirmTitle = "Konfirmasi Hapus",
  deleteConfirmMessage = (item: T) =>
    `Apakah Anda yakin ingin menghapus "${
      (item as { name?: string })?.name || "item ini"
    }"?`,
}: ListGridProps<T>) {
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
    queryKey: [resourcePath, apiBaseURL],
    queryFn: async () => {
      if (!resourcePath) return null;

      const fullURL = apiBaseURL
        ? `${apiBaseURL}${resourcePath}`
        : resourcePath;

      const { data } = await apiClient.get<ApiResponse<T[]>>(fullURL);
      return data;
    },
    enabled: !!resourcePath && !data, // Only fetch if resourcePath provided and no data prop
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes
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
  const rows = useMemo(() => {
    if (actualData) {
      // Extract array from various API response formats
      const dataArray = extractDataArray(actualData);

      // Automatically map data array to rows
      return dataArray.map((item) => {
        const record = item as Record<string, string | number | boolean>;
        return {
          key: String(record[keyField] ?? ""),
          id: String(record[idField] ?? ""),
          name: String(record[nameField] ?? ""),
          _originalItem: item, // Store original item for type safety
          ...record, // Spread all data for column value functions
        } as Row;
      });
    }

    // Use manually provided rows
    return manualRows ?? [];
  }, [actualData, manualRows, keyField, idField, nameField]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  // Use external or internal pagination state
  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const onPageChange = externalOnPageChange ?? setInternalCurrentPage;

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    item: Row;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
      id: string
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

  // Create action buttons renderer
  const renderActions = useMemo(() => {
    if (processedActionButtons) {
      return createActionButtons(
        processedActionButtons,
        openDeleteDialog as (id: string, item: unknown) => void
      );
    }

    return null;
  }, [processedActionButtons]);

  // Create add button (support both old and new way)
  const renderAddButton = useMemo(() => {
    // New way: from actionButtons.add
    if (actionButtons?.add) {
      return createAddButtonFromConfig(actionButtons);
    }

    // Old way: from separate addButton prop (deprecated)
    if (addButton) {
      return createAddButton(addButton);
    }

    return null;
  }, [actionButtons, addButton]);

  // Transform rows to include column values and actions
  const transformedRows = useMemo(() => {
    return rows.map((row) => {
      const transformedRow: Record<
        string,
        ReactNode | string | number | boolean | undefined
      > = { ...row };

      // Apply column value functions if defined
      columns.forEach((column) => {
        if (column.value && column.key !== "actions") {
          transformedRow[column.key] = column.value(row as T);
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
          (val) => typeof val === "string" && val.toLowerCase().includes(q)
        )
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
  const totalPages = externalTotalCount
    ? Math.ceil(externalTotalCount / pageSize)
    : Math.ceil(filteredRows.length / pageSize);

  const paginatedRows = useMemo(() => {
    // If using external pagination (server-side), don't slice - data is already paginated
    if (externalTotalCount !== undefined) {
      return filteredRows;
    }

    // Client-side pagination
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, currentPage, pageSize, externalTotalCount]);

  useEffect(() => {
    // Only reset page if not externally controlled
    if (!externalOnPageChange) {
      setInternalCurrentPage(1);
    }
  }, [searchQuery, rows, externalOnPageChange]);

  const renderMobileCard = (item: Row, _index: number) => {
    return (
      <div
        key={item.key}
        className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
      >
        {/* Colored top border */}
        <div className="h-1 bg-linear-to-r from-gray-500 to-gray-900" />

        <div className="p-4 space-y-3">
          {columns
            .filter((col) => col.key !== "actions")
            .map((column, columnIndex) => (
              <div
                key={`${item.key}-${column.key}`}
                className={`flex flex-col ${
                  columnIndex !== columns.length - 2
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
            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              {item.actions}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMobileSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: pageSize }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="h-1 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-4 space-y-3">
            {columns
              .filter((col) => col.key !== "actions")
              .map((_, columnIndex) => (
                <div
                  key={columnIndex}
                  className={`${
                    columnIndex !== columns.length - 2
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

  const renderOptionsMenu = () => {
    if (optionsMenu.length === 0) return null;

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly size="sm" variant="light">
            <Icon icon="lucide:ellipsis-vertical" className="w-5 h-5" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Options menu"
          onAction={(key) => {
            const menuItem = optionsMenu.find((item) => item.key === key);

            if (menuItem && menuItem.onPress) {
              menuItem.onPress();
            }
          }}
        >
          {optionsMenu.map((item) => (
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

  if (actualError) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {!withoutBreadcrumbs && (
          <PageHeader
            breadcrumbs={breadcrumbs}
            title={title}
            description={description}
          />
        )}
        <ErrorState
          title="Gagal Memuat Data"
          message={actualErrorObj?.message || "Terjadi kesalahan tak dikenal."}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // console.log('check empty  conditon', empty)

  // if (loading) {
  //   return <LoadingScreen isLoading={loading} />;
  // }
  return (
    <>
      <LoadingScreen isLoading={actualLoading} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {!withoutBreadcrumbs ? (
          <PageHeader
            actions={
              <div className="flex items-center gap-2">
                {!isMobile && renderOptionsMenu()}
                {renderAddButton || customActions}
              </div>
            }
            breadcrumbs={breadcrumbs}
            description={description}
            title={title}
            onOptionsClick={onOptionsClick}
          />
        ) : (
          /* Show action buttons even without breadcrumbs */
          (renderAddButton || customActions || renderOptionsMenu()) && (
            <div className="flex justify-end items-center gap-2">
              {!isMobile && renderOptionsMenu()}
              {renderAddButton || customActions}
            </div>
          )
        )}

        {onSearch && (
          <SearchBar
            placeholder={searchPlaceholder}
            onSearch={(val) => {
              setSearchQuery(val);
              onSearch?.(val);
            }}
          />
        )}

        {actualLoading ? (
          isMobile ? (
            renderMobileSkeleton()
          ) : (
            <>
              <SkeletonTable columns={columns.length} rows={pageSize} />
            </>
          )
        ) : rows.length === 0 ? (
          // CASE: No data available
          <EmptyState
            title="Tidak ada data"
            description="Belum ada data yang tersedia."
            icon={<Icon icon="lucide:file-text" className="w-12 h-12" />}
          />
        ) : filteredRows.length === 0 ? (
          empty ?? (
            <>
              <EmptyState
                title="Data kosong"
                description="Tidak ada data yang ditemukan."
                icon={<Icon icon="lucide:file-text" className="w-12 h-12" />}
              />
            </>
          )
        ) : isMobile ? (
          <div className="space-y-4">
            {/* Responsive grid: 1 column on mobile, 2 columns on tablet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedRows.map((item, index) =>
                renderMobileCard(item as Row, index)
              )}
            </div>

            {showPagination && totalPages > 1 && (
              <div className="flex justify-center pt-4">
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
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Table aria-label="Tabel">
              <TableHeader columns={columns}>
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
                    // key={item.key}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {(columnKey) => (
                      <TableCell>
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

            {showPagination && totalPages > 1 && (
              <div className="flex justify-center pt-4">
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
              </div>
            )}
          </div>
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        confirmLabel="Hapus"
        isLoading={isDeleting}
        isOpen={isDeleteDialogOpen}
        message={
          itemToDelete
            ? deleteConfirmMessage(
                (itemToDelete.item._originalItem || itemToDelete.item) as T
              )
            : "Apakah Anda yakin?"
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
    </>
  );
}
