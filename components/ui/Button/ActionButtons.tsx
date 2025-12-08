/**
 * Pre-built action buttons for ListGrid
 * Makes it easy to create common CRUD actions with predefined constants
 */

// import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { Icon } from "@iconify/react";
import { ReactNode } from "react";
import { LinkButton } from "./LinkButton";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Creates an auto-routing handler that generates routes dynamically
 * Works with Next.js App Router by returning a special marker object
 * that the createActionButtons function will detect and convert to router.push()
 * 
 * @param basePath - The base path for the route (e.g., "/posts")
 * @param suffix - Optional suffix to append after the ID (e.g., "/edit")
 * @returns A function that navigates to the generated route
 *
 * @example
 * ```tsx
 * const handleEdit = createAutoRouteHandler("/posts", "/edit");
 * handleEdit("123"); // Navigates to /posts/123/edit
 * ```
 */
export function createAutoRouteHandler(
  basePath: string,
  suffix?: string
): (id: string) => void {
  // Return a function that has a special property marker
  const handler = (id: string) => {
    // This shouldn't be called directly, but in case it is:
    const route = generateRoute(basePath, id, suffix);
    if (typeof window !== "undefined") {
      window.location.href = route;
    }
  };
  
  // Add metadata for detection by createActionButtons
  (handler as AutoRouteHandler).__autoRoute = {
    basePath,
    suffix,
  };
  
  return handler;
}

/**
 * Internal helper to generate route path
 */
function generateRoute(basePath: string, id: string, suffix?: string): string {
  const normalizedBase = basePath.replace(/\/$/, "");
  return suffix 
    ? `${normalizedBase}/${id}${suffix}`
    : `${normalizedBase}/${id}`;
}

/**
 * Check if a handler is an auto-route handler
 */
export function isAutoRouteHandler(handler: RouteHandler): handler is AutoRouteHandler {
  return "__autoRoute" in handler && handler.__autoRoute !== undefined;
}

/**
 * Extract route for a given ID from an auto-route handler
 */
export function getAutoRoute(handler: AutoRouteHandler, id: string): string {
  const { basePath, suffix } = handler.__autoRoute;
  return generateRoute(basePath, id, suffix);
}

// ============================================
// TYPE DEFINITIONS FOR AUTO-ROUTING
// ============================================

type RouteHandler = (id: string) => void;

// Auto-route handler with metadata
interface AutoRouteHandler extends RouteHandler {
  __autoRoute: {
    basePath: string;
    suffix?: string;
  };
}

type BasePathOrHandler = string | RouteHandler;

interface ShowButtonConfig {
  label: string;
  icon: ReactNode;
  onClick: RouteHandler;
}

interface EditButtonConfig {
  label: string;
  icon: ReactNode;
  onClick: RouteHandler;
}

interface DeleteButtonConfig {
  label: string;
  icon: ReactNode;
  onDelete: (id: string, item?: unknown) => void;
}

// ============================================
// PREDEFINED ACTION BUTTON CONSTANTS
// ============================================

/**
 * Predefined action button types that can be used with ListGrid
 *
 * @example
 * OLD WAY (still supported):
 * ```tsx
 * import { ACTION_BUTTONS } from '@/components/ui/Button/ActionButtons';
 *
 * <ListGrid
 *   actionButtons={{
 *     show: ACTION_BUTTONS.SHOW((id) => router.push(`/posts/${id}`)),
 *     edit: ACTION_BUTTONS.EDIT((id) => router.push(`/posts/${id}/edit`)),
 *     delete: ACTION_BUTTONS.DELETE(handleDelete),
 *   }}
 * />
 * ```
 *
 * @example
 * NEW WAY (auto-routing):
 * ```tsx
 * import { ACTION_BUTTONS } from '@/components/ui/Button/ActionButtons';
 *
 * <ListGrid
 *   actionButtons={{
 *     show: ACTION_BUTTONS.SHOW("/posts"),       // auto-generates /posts/{id}
 *     edit: ACTION_BUTTONS.EDIT("/posts"),       // auto-generates /posts/{id}/edit
 *     delete: ACTION_BUTTONS.DELETE(handleDelete),
 *   }}
 * />
 * ```
 */
export const ACTION_BUTTONS = {
  /**
   * Predefined "View/Show" button with auto-routing support
   * 
   * @param basePathOrHandler - Either a base path string (e.g., "/posts") for auto-routing,
   *                           or a custom onClick handler function
   * 
   * @example
   * Auto-routing (NEW):
   * ```tsx
   * show: ACTION_BUTTONS.SHOW("/posts")  // Generates /posts/{id}
   * ```
   * 
   * @example
   * Custom handler (OLD - backward compatible):
   * ```tsx
   * show: ACTION_BUTTONS.SHOW((id) => router.push(`/posts/${id}`))
   * ```
   */
  SHOW: (basePathOrHandler: BasePathOrHandler): ShowButtonConfig => {
    if (typeof basePathOrHandler === "string") {
      // Auto-routing mode: create a handler with metadata
      return {
        label: "View",
        icon: <Icon icon="lucide:eye" className="w-4 h-4" />,
        onClick: createAutoRouteHandler(basePathOrHandler),
      };
    } else {
      // Custom handler mode (backward compatible)
      return {
        label: "View",
        icon: <Icon icon="lucide:eye" className="w-4 h-4" />,
        onClick: basePathOrHandler,
      };
    }
  },

  /**
   * Predefined "Edit" button with auto-routing support
   * 
   * @param basePathOrHandler - Either a base path string (e.g., "/posts") for auto-routing,
   *                           or a custom onClick handler function
   * 
   * @example
   * Auto-routing (NEW):
   * ```tsx
   * edit: ACTION_BUTTONS.EDIT("/posts")  // Generates /posts/{id}/edit
   * ```
   * 
   * @example
   * Custom handler (OLD - backward compatible):
   * ```tsx
   * edit: ACTION_BUTTONS.EDIT((id) => router.push(`/posts/${id}/edit`))
   * ```
   */
  EDIT: (basePathOrHandler: BasePathOrHandler): EditButtonConfig => {
    if (typeof basePathOrHandler === "string") {
      // Auto-routing mode: create a handler with metadata and /edit suffix
      return {
        label: "Edit",
        icon: <Icon icon="lucide:pencil" className="w-4 h-4" />,
        onClick: createAutoRouteHandler(basePathOrHandler, "/edit"),
      };
    } else {
      // Custom handler mode (backward compatible)
      return {
        label: "Edit",
        icon: <Icon icon="lucide:pencil" className="w-4 h-4" />,
        onClick: basePathOrHandler,
      };
    }
  },

  /**
   * Predefined "View" button (alias for SHOW) with auto-routing support
   * 
   * @param basePathOrHandler - Either a base path string (e.g., "/posts") for auto-routing,
   *                           or a custom onClick handler function
   * 
   * @example
   * Auto-routing (NEW):
   * ```tsx
   * view: ACTION_BUTTONS.VIEW("/posts")  // Generates /posts/{id}
   * ```
   */
  VIEW: (basePathOrHandler: BasePathOrHandler): ShowButtonConfig => {
    // VIEW is just an alias for SHOW
    return ACTION_BUTTONS.SHOW(basePathOrHandler);
  },

  /**
   * Predefined "Delete" button
   * @param onDelete - Function to call when delete is confirmed, receives the item ID
   * 
   * @example
   * ```tsx
   * delete: ACTION_BUTTONS.DELETE(handleDelete)
   * ```
   */
  DELETE: (onDelete: (id: string, item?: unknown) => void): DeleteButtonConfig => ({
    label: "Delete",
    icon: <Icon icon="lucide:trash-2" className="w-4 h-4" />,
    onDelete,
  }),
} as const;

/**
 * Predefined add/create button
 *
 * @example
 * ```tsx
 * <ListGrid
 *   addButton={ADD_BUTTON.CREATE("/posts/create")}
 * />
 * ```
 */
export const ADD_BUTTON = {
  /**
   * Predefined "Create" button
   * @param href - The URL to navigate to when clicked
   */
  CREATE: (href: string) => ({
    label: "Create",
    icon: <Icon icon="lucide:plus" className="w-4 h-4" />,
    href,
  }),

  /**
   * Predefined "Add" button
   * @param href - The URL to navigate to when clicked
   */
  ADD: (href: string) => ({
    label: "Add",
    icon: <Icon icon="lucide:plus" className="w-4 h-4" />,
    href,
  }),
} as const;

// ============================================
// TYPE DEFINITIONS (for advanced users)
// ============================================

export interface ActionButtonConfig {
  // Add/Create button (shows in header, not in table rows)
  add?: {
    href: string;
    label?: string;
    icon?: ReactNode;
    color?:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger";
    variant?:
      | "solid"
      | "bordered"
      | "light"
      | "flat"
      | "faded"
      | "shadow"
      | "ghost";
  };

  // Row action buttons (show in table rows)
  show?: {
    href?: string;
    onClick?: (id: string) => void;
    label?: string;
    icon?: ReactNode;
  };
  edit?: {
    href?: string;
    onClick?: (id: string) => void;
    label?: string;
    icon?: ReactNode;
  };
  delete?: {
    onDelete: (id: string, item?: string | unknown) => void;
    label?: string;
    icon?: ReactNode;
    confirmMessage?: (item: string | unknown) => string;
  };
  custom?: Array<{
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
    variant?:
      | "solid"
      | "bordered"
      | "light"
      | "flat"
      | "faded"
      | "shadow"
      | "ghost";
    onClick?: (id: string, item?: unknown) => void;
    href?: string;
  }>;
}

export interface AddButtonConfig {
  href: string;
  label?: string;
  icon?: ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
}

/**
 * Create action buttons for table rows with auto-routing support
 * 
 * This function detects auto-route handlers and converts them to Link components
 * for better performance and SEO. Manual onClick handlers are preserved as buttons.
 */
export const createActionButtons = (
  config: ActionButtonConfig,
  openDeleteDialog: (id: string, item: unknown) => void
) => {
  type RowLike = { id: string; [key: string]: unknown };

  const renderRowActions = (item: RowLike) => {
    const buttons: ReactNode[] = [];

    // Show/View button
    if (config.show) {
      if (config.show.onClick) {
        // Check if it's an auto-route handler
        if (isAutoRouteHandler(config.show.onClick)) {
          // Convert to Link for auto-routing
          const href = getAutoRoute(config.show.onClick, item.id);
          buttons.push(
            <LinkButton
              key="show"
              color="primary"
              href={href}
              size="sm"
              startContent={config.show.icon || <Icon icon="lucide:eye" className="w-4 h-4" />}
              variant="light"
            >
              {config.show.label || "Detail"}
            </LinkButton>
          );
        } else {
          // Regular onClick handler (backward compatible)
          buttons.push(
            <button
              key="show"
              className="text-blue-600 hover:text-blue-700 transition-colors p-1.5 rounded-md hover:bg-blue-50"
              onClick={() => config.show?.onClick?.(item.id)}
              title={config.show.label || "Detail"}
            >
              {config.show.icon || <Icon icon="lucide:eye" className="w-4 h-4" />}
            </button>
          );
        }
      } else if (config.show.href) {
        // Manual href provided (old way)
        const showHref = config.show.href || "#";
        buttons.push(
          <LinkButton
            key="show"
            color="primary"
            href={showHref}
            size="sm"
            startContent={config.show.icon || <Icon icon="lucide:eye" className="w-4 h-4" />}
            variant="light"
          >
            {config.show.label || "Detail"}
          </LinkButton>
        );
      }
    }

    // Edit button
    if (config.edit) {
      if (config.edit.onClick) {
        // Check if it's an auto-route handler
        if (isAutoRouteHandler(config.edit.onClick)) {
          // Convert to Link for auto-routing
          const href = getAutoRoute(config.edit.onClick, item.id);
          buttons.push(
            <LinkButton
              key="edit"
              color="warning"
              href={href}
              size="sm"
              startContent={config.edit.icon || <Icon icon="lucide:pencil" className="w-4 h-4" />}
              variant="light"
            >
              {config.edit.label || "Edit"}
            </LinkButton>
          );
        } else {
          // Regular onClick handler (backward compatible)
          buttons.push(
            <button
              key="edit"
              className="text-yellow-600 hover:text-yellow-700 transition-colors p-1.5 rounded-md hover:bg-yellow-50"
              onClick={() => config.edit?.onClick?.(item.id)}
              title={config.edit.label || "Edit"}
            >
              {config.edit.icon || <Icon icon="lucide:pencil" className="w-4 h-4" />}
            </button>
          );
        }
      } else if (config.edit.href) {
        // Manual href provided (old way)
        const editHref = config.edit.href || "#";
        buttons.push(
          <LinkButton
            key="edit"
            color="warning"
            href={editHref}
            size="sm"
            startContent={config.edit.icon || <Icon icon="lucide:pencil" className="w-4 h-4" />}
            variant="light"
          >
            {config.edit.label || "Edit"}
          </LinkButton>
        );
      }
    }

    // Custom buttons
    if (config.custom) {
      config.custom.forEach((customBtn) => {
        if (customBtn.href) {
          const customHref = customBtn.href || "#";
          buttons.push(
            <LinkButton
              key={customBtn.key}
              color={customBtn.color || "default"}
              href={customHref}
              size="sm"
              startContent={customBtn.icon}
              variant={customBtn.variant || "light"}
            >
              {customBtn.label}
            </LinkButton>
          );
        } else if (customBtn.onClick) {
          buttons.push(
            <button
              key={customBtn.key}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                customBtn.color === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : customBtn.color === "warning"
                  ? "text-yellow-600 hover:bg-yellow-50"
                  : customBtn.color === "success"
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => customBtn.onClick?.(item.id, item)}
            >
              {customBtn.icon && (
                <span className="inline-block mr-1">{customBtn.icon}</span>
              )}
              {customBtn.label}
            </button>
          );
        }
      });
    }

    // Delete button
    if (config.delete) {
      buttons.push(
        <button
          key="delete"
          className="text-red-600 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50"
          title={config.delete.label || "Hapus"}
          onClick={() => openDeleteDialog(item.id, item)}
        >
          {config.delete.icon || <Icon icon="lucide:trash-2" className="w-4 h-4" />}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">{buttons}</div>
    );
  };

  return renderRowActions;
};

/**
 * Create add/create button for header actions (from ActionButtonConfig)
 */
export const createAddButtonFromConfig = (config: ActionButtonConfig) => {
  if (!config.add) return null;

  return (
    <LinkButton
      color={config.add.color || "primary"}
      href={config.add.href}
      size="md"
      startContent={config.add.icon || <Icon icon="lucide:plus" className="w-4 h-4" />}
      variant={config.add.variant || "solid"}
    >
      {config.add.label || "Tambah"}
    </LinkButton>
  );
};

/**
 * Create add/create button for header actions (standalone)
 * @deprecated Use actionButtons.add instead
 */
export const createAddButton = (config: AddButtonConfig) => {
  return (
    <LinkButton
      color={config.color || "primary"}
      href={config.href}
      size="md"
      startContent={config.icon || <Icon icon="lucide:plus" className="w-4 h-4" />}
      variant={config.variant || "solid"}
    >
      {config.label || "Tambah"}
    </LinkButton>
  );
};
