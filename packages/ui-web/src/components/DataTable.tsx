import { forwardRef, useMemo, useState, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface ColumnDef<T> {
  /** Column key (used for sorting, etc.) */
  key: string;
  /** Column header label */
  header: string;
  /** Cell renderer */
  cell: (row: T, rowIndex: number) => ReactNode;
  /** Column width */
  width?: string;
  /** Minimum width */
  minWidth?: string;
  /** Maximum width */
  maxWidth?: string;
  /** Alignment */
  align?: "left" | "center" | "right";
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column can be hidden */
  hideable?: boolean;
  /** Header className */
  headerClassName?: string;
  /** Cell className */
  cellClassName?: string;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Row data */
  data: T[];
  /** Unique key for each row */
  rowKey: (row: T) => string;
  /** Row selection */
  selection?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  /** Row actions */
  rowActions?: RowAction<T>[];
  /** Sort state */
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  /** Pagination */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };
  /** Density */
  density?: "compact" | "comfortable";
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
  /** Loading row count (for skeleton) */
  loadingRows?: number;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Row className function */
  rowClassName?: (row: T) => string;
  /** Striped rows */
  striped?: boolean;
  /** Hoverable rows */
  hoverable?: boolean;
  /** Show row numbers */
  showRowNumbers?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "ghost";
  icon?: ReactNode;
  disabled?: (row: T) => boolean;
  hide?: (row: T) => boolean;
}

const densityStyles = {
  compact: { cell: "px-3 py-1.5", header: "px-3 py-2" },
  comfortable: { cell: "px-4 py-3", header: "px-4 py-3" },
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  selection,
  onSelectionChange,
  rowActions,
  sortBy,
  sortOrder,
  onSort,
  pagination,
  density = "comfortable",
  emptyMessage = "데이터가 없습니다.",
  loading = false,
  loadingRows = 5,
  onRowClick,
  rowClassName,
  striped = false,
  hoverable = true,
  showRowNumbers = false,
  className,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<{ key: string; order: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    if (!columns.find((c) => c.key === key)?.sortable) return;
    setSortState((prev) => ({
      key,
      order: prev?.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
    onSort?.(key);
  };

  const isSorted = (key: string) => sortState?.key === key || sortBy === key;
  const currentSortOrder = sortState?.order || sortOrder;

  const sortedData = useMemo(() => {
    if (!sortState && !sortBy) return data;
    const key = sortState?.key || sortBy;
    const order = sortState?.order || sortOrder;
    if (!key) return data;

    const column = columns.find((c) => c.key === key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aVal = a[key as keyof T];
      const bVal = b[key as keyof T];
      if (aVal === bVal) return 0;
      const comparison = aVal < bVal ? -1 : 1;
      return order === "asc" ? comparison : -comparison;
    });
  }, [data, sortState, sortBy, sortOrder, columns]);

  const allSelected = onSelectionChange && data.length > 0 && data.every((row) => selection?.has(rowKey(row)));
  const someSelected = onSelectionChange && data.some((row) => selection?.has(rowKey(row)));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      const newSelection = new Set(data.map((row) => rowKey(row)));
      onSelectionChange(newSelection);
    }
  };

  const handleRowSelect = (row: T) => {
    if (!onSelectionChange) return;
    const id = rowKey(row);
    const newSelection = new Set(selection || []);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  const visibleColumns = columns.filter((c) => !c.hideable || true);

  if (loading) {
    const skeletonRows = Array.from({ length: loadingRows }, (_, i) => i);
    return (
      <div className={cn("overflow-x-auto rounded-lg border border-border-primary", className)}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-primary">
              {onSelectionChange && (
                <th className={cn("w-12", densityStyles[density].header)} aria-hidden="true">
                  <div className="animate-pulse bg-bg-tertiary rounded h-4 w-4" />
                </th>
              )}
              {showRowNumbers && (
                <th className={cn("w-10", densityStyles[density].header)} aria-hidden="true">
                  <div className="animate-pulse bg-bg-tertiary rounded h-4 w-6" />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left font-medium text-text-secondary bg-bg-tertiary",
                    densityStyles[density].header,
                    column.headerClassName
                  )}
                  style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
                >
                  <div className="animate-pulse bg-bg-secondary rounded h-4" style={{ width: "60%" }} />
                </th>
              ))}
              {rowActions && (
                <th className={cn("w-32", densityStyles[density].header)} aria-hidden="true">
                  <div className="animate-pulse bg-bg-tertiary rounded h-4 w-16" />
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {skeletonRows.map((_, i) => (
              <tr key={i} className="border-b border-border-primary">
                {onSelectionChange && <td className={cn(densityStyles[density].cell)} aria-hidden="true"><div className="animate-pulse bg-bg-tertiary rounded h-4 w-4" /></td>}
                {showRowNumbers && <td className={cn(densityStyles[density].cell)}><div className="animate-pulse bg-bg-tertiary rounded h-4 w-6" /></td>}
                {visibleColumns.map((column) => (
                  <td key={column.key} className={cn(densityStyles[density].cell, column.cellClassName)}>
                    <div className="animate-pulse bg-bg-tertiary rounded h-4" style={{ width: "80%" }} />
                  </td>
                ))}
                {rowActions && <td className={cn(densityStyles[density].cell)}><div className="animate-pulse bg-bg-tertiary rounded h-6 w-20" /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border-primary", className)}>
        <div className="text-center py-12 text-text-tertiary">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border-primary", className)}>
      <table className="w-full border-collapse" role="grid">
        <thead>
          <tr className="border-b border-border-primary bg-bg-tertiary">
            {onSelectionChange && (
              <th scope="col" className={cn("w-12 text-center", densityStyles[density].header)}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-border-primary text-primary-600 focus:ring-primary-500"
                  aria-label="전체 선택"
                />
              </th>
            )}
            {showRowNumbers && (
              <th scope="col" className={cn("w-10 text-center text-text-tertiary", densityStyles[density].header)}>
                #
              </th>
            )}
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "font-medium text-text-secondary",
                  column.sortable ? "cursor-pointer select-none hover:text-text-primary" : "",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  densityStyles[density].header,
                  column.headerClassName
                )}
                style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
                onClick={() => column.sortable && handleSort(column.key)}
                aria-sort={isSorted(column.key) ? (currentSortOrder === "asc" ? "ascending" : "descending") : "none"}
              >
                <div className="flex items-center gap-1.5">
                  {column.header}
                  {column.sortable && isSorted(column.key) && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      {currentSortOrder === "asc" ? (
                        <path d="M18 15l-6-6-6 6" />
                      ) : (
                        <path d="M6 9l6 6 6-6" />
                      )}
                    </svg>
                  )}
                </div>
              </th>
            ))}
            {rowActions && (
              <th scope="col" className={cn("w-32", densityStyles[density].header)} aria-hidden="true">
                작업
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => {
            const id = rowKey(row);
            const isSelected = selection?.has(id);
            const actions = rowActions?.filter((a) => !a.hide?.(row)) || [];
            
            return (
              <tr
                key={id}
                className={cn(
                  "border-b border-border-primary",
                  isSelected && "bg-primary-50/50",
                  striped && rowIndex % 2 === 1 && "bg-bg-secondary/50",
                  hoverable && "hover:bg-bg-tertiary/50",
                  onRowClick && "cursor-pointer",
                  rowClassName?.(row)
                )}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && onRowClick) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : "row"}
              >
                {onSelectionChange && (
                  <td className={cn("text-center", densityStyles[density].cell)}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelect(row);
                      }}
                      className="h-4 w-4 rounded border-border-primary text-primary-600 focus:ring-primary-500"
                      aria-label={`${row[columns[0]?.key as keyof T] || id} 선택`}
                    />
                  </td>
                )}
                {showRowNumbers && (
                  <td className={cn("text-center text-text-tertiary", densityStyles[density].cell)}>
                    {rowIndex + 1}
                  </td>
                )}
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      densityStyles[density].cell,
                      column.cellClassName
                    )}
                  >
                    {column.cell(row, rowIndex)}
                  </td>
                ))}
                {rowActions && (
                  <td className={cn(densityStyles[density].cell)}>
                    <div className="flex items-center gap-1">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          disabled={action.disabled?.(row)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors",
                            action.variant === "destructive"
                              ? "text-error-600 hover:bg-error-50 hover:text-error-700"
                              : action.variant === "ghost"
                              ? "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                              : "text-primary-600 hover:bg-primary-50 hover:text-primary-700",
                            "disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2"
                          )}
                          aria-label={action.label}
                        >
                          {action.icon && <span className="size-3.5">{action.icon}</span>}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border-primary">
          <div className="text-sm text-text-secondary">
            {pagination.total > 0
              ? `보이기 ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} / ${pagination.total}건`
              : "데이터 없음"}
          </div>
          <div className="flex items-center gap-2">
            {pagination.onPageSizeChange && pagination.pageSizeOptions && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                className="px-3 py-1.5 text-sm border border-border-primary rounded-lg bg-background-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                aria-label="페이지 크기"
              >
                {pagination.pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}개씩
                  </option>
                ))}
              </select>
            )}
            <nav className="flex items-center gap-1" aria-label="페이지네이션">
              <button
                type="button"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                aria-label="첫 페이지"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                  <path d="M9 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                aria-label="이전 페이지"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }, (_, i) => {
                let pageNum: number;
                const totalPages = Math.ceil(pagination.total / pagination.pageSize);
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg font-medium transition-colors",
                      pagination.page === pageNum
                        ? "bg-primary-600 text-white"
                        : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    )}
                    aria-label={`페이지 ${pageNum}`}
                    aria-current={pagination.page === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                aria-label="다음 페이지"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => pagination.onPageChange(Math.ceil(pagination.total / pagination.pageSize))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                aria-label="마지막 페이지"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                  <path d="M15 6l6 6-6 6" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";