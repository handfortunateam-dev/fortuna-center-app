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
  Button,
  Selection,
} from "@heroui/react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  ACTION_BUTTONS,
  ADD_BUTTON,
} from "@/components/button/ActionButtons";
import { StateMessage } from "@/components/state-message";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

// Sub-components
import { MobileCard, MobileSkeleton } from "./MobileCard";
import { OptionsMenu } from "./OptionsMenu";
import { FiltersPanel } from "./FiltersPanel";
import { ColumnVisibilityDropdown } from "./ColumnVisibilityDropdown";
import { RowsPerPageSelector } from "./RowsPerPageSelector";
import { BulkActionsBar } from "./BulkActionsBar";
import { ContextMenu } from "./ContextMenu";

// Types, constants, utils
import {
  Column,
  Row,
  TypedRow,
  BulkAction,
  DataExtractor,
  ListGridProps,
  OptionsMenuItem,
} from "./types";
import { RESOURCE_CONFIG } from "./constants";

export type { Columns, ColumnDef } from "./types";
export { createColumn, createColumns, createBulkAction } from "./utils";
export type {
  BulkAction,
  Column,
  TypedRow,
  Row,
  PrimitiveKeys,
  AllKeys,
  OptionsMenuItem,
} from "./types";

// ==================== MAIN COMPONENT ====================

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
  enableEdit = false,
  enableDelete = true,
  basePath,
  onRowClick,
  enableRowClick,
  selectionMode = "none",
  selectedKeys: controlledSelectedKeys,
  onSelectionChange: controlledOnSelectionChange,
  bulkActions = [],
  onBulkDelete,
  bulkDeleteConfirmTitle = "Confirm Bulk Delete",
  bulkDeleteConfirmMessage = (count: number) =>
    `Are you sure you want to delete ${count} selected items?`,
  enableColumnVisibility = false,
  defaultVisibleColumns,
  onVisibleColumnsChange,
  columnVisibilityStorageKey,
  enableExport = false,
  onExport,
  enableImport = false,
  onImport,
  exportResourcePath,
  additionalOptions = [],
  customOptions = [],
  rowsPerPageOptions = [10, 20, 50, 100],
  onPageSizeChange,
  filters: filterConfigs = [],
  onFilterChange: externalOnFilterChange,
  filterValues: externalFilterValues,
}: ListGridProps<T>) {
  // Apply defaults based on resourcePath if available
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
    onPageChange(1);
  };

  useEffect(() => {
    setInternalPageSize(pageSize);
  }, [pageSize]);

  // Selection state
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

    if (defaultVisibleColumns) {
      return new Set(defaultVisibleColumns);
    }

    return new Set(
      columns
        .filter((col) => col.defaultVisible !== false)
        .map((col) => col.key),
    );
  }, [columnVisibilityStorageKey, defaultVisibleColumns, columns]);

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    getInitialVisibleColumns,
  );

  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const onPageChange = externalOnPageChange ?? setInternalCurrentPage;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    row: Row;
  } | null>(null);

  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const effectiveSelectionMode = isSelectionActive ? "multiple" : selectionMode;
  const tableRef = useRef<HTMLDivElement>(null);

  // Animate checkbox column on selection activation
  useEffect(() => {
    if (!isSelectionActive || !tableRef.current) return;

    const frame = requestAnimationFrame(() => {
      const cells = tableRef.current?.querySelectorAll<HTMLElement>(
        "td:first-child, th:first-child",
      );
      if (!cells) return;

      cells.forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = "translateX(-10px)";
        el.style.transition = "none";

        setTimeout(() => {
          el.style.transition = "opacity 0.22s ease, transform 0.22s ease";
          el.style.opacity = "1";
          el.style.transform = "translateX(0)";
        }, i * 18);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isSelectionActive]);

  // Close context menu on outside click or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, row: Row) => {
    e.preventDefault();
    const menuW = 192;
    const menuH = 180;
    const x =
      e.clientX + menuW > window.innerWidth ? e.clientX - menuW : e.clientX;
    const y =
      e.clientY + menuH > window.innerHeight ? e.clientY - menuH : e.clientY;
    setContextMenu({ x, y, row });
  };

  const handleContextMenuSelect = (row: Row) => {
    setIsSelectionActive(true);
    const current =
      selectedKeys === "all"
        ? new Set(rows.map((r) => r.key))
        : new Set(selectedKeys as Set<string>);
    current.add(row.key);
    onSelectionChange(current);
    setContextMenu(null);
  };

  const handleContextMenuDelete = (row: Row) => {
    openDeleteDialog(String(row.id || row.key), row);
    setContextMenu(null);
  };

  // Debounce search query for server-side
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (serverSide) {
        onPageChange(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, serverSide, onPageChange]);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    item: Row;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMobileDevice = useMediaQuery("(max-width: 1024px)");
  const isMobile = isMobileProp ?? isMobileDevice;
  const queryClient = useQueryClient();

  // Determine API base URL
  const getAPIBaseURL = () => {
    if (externalAPIBaseURL) return externalAPIBaseURL;
    if (useExternalAPI) return process.env.NEXT_PUBLIC_SETTINGS_API_URL || "";
    return "";
  };

  const apiBaseURL = getAPIBaseURL();

  // Auto-fetch data
  const {
    data: fetchedData,
    isLoading,
    isFetching,
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
    enabled: !!resourcePath && !data,
    staleTime: 1000 * 60 * 5,
    gcTime: 10 * 60 * 1000,
  });

  const actualData = data || fetchedData;
  const actualLoading = loading || isLoading || isFetching || isDeleting;
  const actualError = isError || isFetchError;
  const actualErrorObj = error || fetchError;

  // Extract array from API response
  const extractDataArray = useCallback(
    (input: DataExtractor<T> | undefined): T[] => {
      if (!input) return [];

      if (Array.isArray(input)) return input;

      if ("data" in input) {
        const nested = input.data;
        if (!nested) return [];
        if (Array.isArray(nested)) return nested;

        if (typeof nested === "object" && "data" in nested) {
          const deepNested = (nested as { data?: unknown }).data;
          if (!deepNested) return [];
          if (Array.isArray(deepNested)) return deepNested as T[];
        }
      }

      return [];
    },
    [],
  );

  // Build rows from data or manualRows
  const rows = useMemo((): TypedRow<T>[] | Row[] => {
    if (actualData) {
      const dataArray = extractDataArray(actualData);

      return dataArray.map((item): TypedRow<T> => {
        const record = item as T & Record<string, unknown>;

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
          _originalItem: item,
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

    return manualRows ?? [];
  }, [actualData, manualRows, keyField, idField, nameField, extractDataArray]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    onPageChange(1);
  };

  const openDeleteDialog = (id: string, item: Row) => {
    setItemToDelete({ id, item });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(itemToDelete.id);
      } else if (actionButtons?.delete) {
        await actionButtons.delete.onDelete(itemToDelete.id, itemToDelete.item);
      } else if (resourcePath) {
        const fullURL = apiBaseURL
          ? `${apiBaseURL}${resourcePath}/${itemToDelete.id}`
          : `${resourcePath}/${itemToDelete.id}`;

        await apiClient.delete(fullURL);
      }

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

  const getSelectedItems = useCallback(() => {
    if (selectedKeys === "all") return rows;
    const selectedSet = selectedKeys as Set<string>;
    return rows.filter((row) => selectedSet.has(row.key));
  }, [selectedKeys, rows]);

  const getSelectedIds = useCallback(() => {
    if (selectedKeys === "all") {
      return rows.map((row) => String(row.id || row.key));
    }
    const selectedSet = selectedKeys as Set<string>;
    return rows
      .filter((row) => selectedSet.has(row.key))
      .map((row) => String(row.id || row.key));
  }, [selectedKeys, rows]);

  const selectedCount = useMemo(() => {
    if (selectedKeys === "all") return rows.length;
    return (selectedKeys as Set<string>).size;
  }, [selectedKeys, rows.length]);

  useEffect(() => {
    if (isSelectionActive && selectedCount === 0) {
      setIsSelectionActive(false);
    }
  }, [selectedCount, isSelectionActive]);

  const handleBulkActionClick = (action: BulkAction<T>) => {
    if (action.confirmTitle || action.confirmMessage) {
      setPendingBulkAction(action);
      setIsBulkDeleteDialogOpen(true);
    } else {
      executeBulkAction(action);
    }
  };

  const executeBulkAction = async (action: BulkAction<T>) => {
    const selectedIds = getSelectedIds();
    const selectedItems = getSelectedItems();

    setIsBulkDeleting(true);
    try {
      const typedItems = selectedItems.map(
        (item) => (item._originalItem ?? item) as T,
      );
      await action.onAction(selectedIds, typedItems);

      onSelectionChange(new Set([]));

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
        for (const id of selectedIds) {
          const fullURL = apiBaseURL
            ? `${apiBaseURL}${resourcePath}/${id}`
            : `${resourcePath}/${id}`;
          await apiClient.delete(fullURL);
        }
      }

      onSelectionChange(new Set([]));

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

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        if (newSet.size > 1) {
          newSet.delete(columnKey);
        }
      } else {
        newSet.add(columnKey);
      }

      if (columnVisibilityStorageKey && typeof window !== "undefined") {
        localStorage.setItem(
          columnVisibilityStorageKey,
          JSON.stringify(Array.from(newSet)),
        );
      }

      onVisibleColumnsChange?.(Array.from(newSet));

      return newSet;
    });
  };

  const filteredColumns = useMemo(() => {
    let cols = enableColumnVisibility
      ? columns.filter((col) => visibleColumns.has(col.key))
      : columns;

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

  const hideableColumns = useMemo(() => {
    return columns.filter(
      (col) => col.hideable !== false && col.key !== "actions",
    );
  }, [columns]);

  // ==================== ROUTING ====================

  const router = useRouter();

  const processedActionButtons = useMemo(() => {
    if (!actionButtons) return null;

    const processed = { ...actionButtons };

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

  const finalActionButtons = useMemo(() => {
    if (!resourcePath) return processedActionButtons;

    const routeBase = basePath || resourcePath;
    const merged = processedActionButtons ? { ...processedActionButtons } : {};

    if (enableCreate && !merged.add && !addButton) {
      merged.add = ADD_BUTTON.CREATE(`${routeBase}/create`);
    }

    if (enableShow && !merged.show) {
      merged.show = ACTION_BUTTONS.SHOW((id) =>
        router.push(`${routeBase}/${id}`),
      );
    }

    if (enableEdit && !merged.edit) {
      merged.edit = ACTION_BUTTONS.EDIT((id) =>
        router.push(`${routeBase}/${id}/edit`),
      );
    }

    if (enableDelete && !merged.delete) {
      merged.delete = ACTION_BUTTONS.DELETE(() => {
        // Placeholder – real logic in handleDeleteConfirm
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

  const isRowClickEnabled = useMemo(() => {
    if (enableRowClick !== undefined) return enableRowClick;
    if (onRowClick) return true;
    if (enableShow && (resourcePath || finalActionButtons?.show)) return true;
    return false;
  }, [
    enableRowClick,
    onRowClick,
    enableShow,
    resourcePath,
    finalActionButtons?.show,
  ]);

  const handleRowClick = useMemo(() => {
    if (!isRowClickEnabled) return null;

    return (row: Row) => {
      const id = String(row.id || row.key);
      const originalItem = (row._originalItem || row) as T;

      if (onRowClick) {
        onRowClick(originalItem, id);
        return;
      }

      if (finalActionButtons?.show?.onClick) {
        finalActionButtons.show.onClick(id);
        return;
      }

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

  const renderActions = useMemo(() => {
    if (finalActionButtons) {
      return createActionButtons(
        finalActionButtons,
        openDeleteDialog as (id: string, item: unknown) => void,
      );
    }
    return null;
  }, [finalActionButtons]);

  const renderAddButton = useMemo(() => {
    if (finalActionButtons?.add) {
      return createAddButtonFromConfig(finalActionButtons);
    }
    if (addButton) {
      return createAddButton(addButton);
    }
    return null;
  }, [finalActionButtons, addButton]);

  // ==================== ROW TRANSFORMATION ====================

  const transformedRows = useMemo(() => {
    return rows.map((row) => {
      const transformedRow: Record<string, ReactNode | T> = { ...row };

      columns.forEach((column) => {
        if (column.value && column.key !== "actions") {
          const originalItem = (row as TypedRow<T>)._originalItem || (row as T);
          transformedRow[column.key] = column.value(originalItem);
        }
      });

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

  const fetchedTotalCount = (fetchedData as { totalCount?: number })
    ?.totalCount;

  const totalPages =
    (externalTotalCount ?? fetchedTotalCount)
      ? Math.ceil(
          (externalTotalCount ?? fetchedTotalCount ?? 0) / internalPageSize,
        )
      : Math.ceil(filteredRows.length / internalPageSize);

  const paginatedRows = useMemo(() => {
    if (externalTotalCount !== undefined || serverSide) {
      return filteredRows;
    }

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
    if (!externalOnPageChange && !serverSide) {
      setInternalCurrentPage(1);
    }
  }, [searchQuery, rows, externalOnPageChange, serverSide]);

  // ==================== BULK ACTIONS BUILDER ====================

  const getBulkActions = (): BulkAction<T>[] => {
    const all: BulkAction<T>[] = [...bulkActions];
    if (
      (enableDelete || onBulkDelete) &&
      !bulkActions.some((a) => a.key === "delete")
    ) {
      all.push({
        key: "delete",
        label: "Delete Selected",
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
    return all;
  };

  // ==================== ERROR STATE ====================

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

  // ==================== RENDER ====================

  return (
    <>
      <LoadingScreen isLoading={actualLoading} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header: title + toolbar */}
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
            {!isMobile && (
              <ColumnVisibilityDropdown
                enableColumnVisibility={enableColumnVisibility}
                hideableColumns={hideableColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                columnVisibilityStorageKey={columnVisibilityStorageKey}
                onVisibleColumnsChange={onVisibleColumnsChange}
                toggleColumnVisibility={toggleColumnVisibility}
              />
            )}
            <FiltersPanel
              filterConfigs={filterConfigs}
              activeFilters={activeFilters}
              onFilterChange={onFilterChange}
              onClearAll={() => {
                const cleared: Record<string, string> = {};
                filterConfigs.forEach((f) => (cleared[f.key] = ""));
                if (!externalFilterValues) {
                  setInternalFilterValues(cleared);
                }
                externalOnFilterChange?.(cleared);
                onPageChange(1);
              }}
            />
            <OptionsMenu
              optionsMenu={optionsMenu}
              customOptions={customOptions}
              additionalOptions={additionalOptions}
              enableImport={enableImport}
              enableExport={enableExport}
              onImport={onImport}
              onExport={onExport}
              exportResourcePath={exportResourcePath}
              resourcePath={resourcePath}
            />
            {renderAddButton || customActions}
          </div>
        </div>

        {/* Search */}
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

        {/* Content */}
        {actualLoading ? (
          isMobile ? (
            <MobileSkeleton
              pageSize={internalPageSize}
              columnsCount={
                filteredColumns.filter((c) => c.key !== "actions").length
              }
            />
          ) : (
            <SkeletonTable
              columns={filteredColumns.length}
              rows={internalPageSize}
            />
          )
        ) : rows.length === 0 ? (
          <StateMessage
            type="empty"
            title="No data available"
            message=""
            icon="lucide:file-text"
          />
        ) : filteredRows.length === 0 ? (
          (empty ?? (
            <StateMessage
              type="empty"
              title="No data available"
              message=""
              icon="lucide:file-text"
            />
          ))
        ) : isMobile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedRows.map((item) => (
                <MobileCard
                  key={item.key as string}
                  item={item as Row}
                  filteredColumns={filteredColumns}
                  handleRowClick={handleRowClick}
                  selectionMode={selectionMode}
                  selectedKeys={selectedKeys}
                  rows={rows}
                  onSelectionChange={onSelectionChange}
                />
              ))}
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
                  <RowsPerPageSelector
                    rowsPerPageOptions={rowsPerPageOptions}
                    internalPageSize={internalPageSize}
                    setInternalPageSize={setInternalPageSize}
                    onPageSizeChange={onPageSizeChange}
                    onPageChange={onPageChange}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4" ref={tableRef}>
            <Table
              aria-label="Tabel"
              selectionMode={effectiveSelectionMode}
              selectedKeys={
                effectiveSelectionMode !== "none" ? selectedKeys : undefined
              }
              onSelectionChange={
                effectiveSelectionMode !== "none"
                  ? onSelectionChange
                  : undefined
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
                    onContextMenu={(e) => handleContextMenu(e, item as Row)}
                  >
                    {(columnKey) => (
                      <TableCell
                        onClick={(e) => {
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
                  <RowsPerPageSelector
                    rowsPerPageOptions={rowsPerPageOptions}
                    internalPageSize={internalPageSize}
                    setInternalPageSize={setInternalPageSize}
                    onPageSizeChange={onPageSizeChange}
                    onPageChange={onPageChange}
                  />
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

      {/* Floating Bulk Action Bar */}
      <BulkActionsBar
        effectiveSelectionMode={effectiveSelectionMode}
        selectedCount={selectedCount}
        bulkActions={getBulkActions()}
        isBulkDeleting={isBulkDeleting}
        pendingBulkAction={pendingBulkAction}
        onSelectionChange={onSelectionChange}
        onBulkActionClick={handleBulkActionClick}
      />

      {/* Right-click Context Menu */}
      <ContextMenu
        contextMenu={contextMenu}
        enableShow={enableShow}
        enableEdit={enableEdit}
        enableDelete={enableDelete}
        finalActionButtons={finalActionButtons}
        onSelect={handleContextMenuSelect}
        onDelete={handleContextMenuDelete}
        onClose={() => setContextMenu(null)}
      />
    </>
  );
}
