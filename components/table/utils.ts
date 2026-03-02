import { Column, BulkAction } from "./types";

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
