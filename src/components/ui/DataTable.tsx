import type { ReactNode } from 'react'
import type { QueryStatus } from '@/hooks/usePagedQuery'
import type { SortOrder } from '@/types/api'
import { Alert } from './Alert'
import { EmptyState, ErrorState } from './StateMessage'

export interface Column<T> {
  key: string
  header: string
  sortKey?: string
  mobileHidden?: boolean
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  status: QueryStatus
  errorMessage?: string
  onRetry: () => void
  emptyTitle: string
  emptyDescription: string
  sortBy?: string
  sortOrder?: SortOrder
  onSort?: (sortKey: string) => void
}

const SKELETON_ROWS = 5

export function DataTable<T>({ columns, rows, rowKey, status, errorMessage, onRetry, emptyTitle, emptyDescription, sortBy, sortOrder, onSort }: DataTableProps<T>) {
  const loadingFirst = status === 'loading' && rows.length === 0
  const refreshing = status === 'loading' && rows.length > 0

  if (status === 'error' && rows.length === 0) {
    return <ErrorState description={errorMessage ?? 'The list could not be loaded.'} onRetry={onRetry} />
  }
  if (status === 'success' && rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && (
        <Alert kind="warning" title="Showing the last loaded list">
          {errorMessage ?? 'The list could not be refreshed.'}{' '}
          <button type="button" className="link font-semibold" onClick={onRetry}>
            Try again
          </button>
        </Alert>
      )}
      <div className={`overflow-x-auto sm:rounded-box sm:border sm:border-base-300 ${refreshing ? 'opacity-60' : ''}`} aria-busy={status === 'loading'}>
        <table className="table">
          <thead className="bg-base-200 text-base-content">
            <tr>
              {columns.map((column) => {
                const sorted = column.sortKey !== undefined && column.sortKey === sortBy
                return (
                  <th key={column.key} className={column.mobileHidden ? 'hidden sm:table-cell' : undefined} aria-sort={sorted ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {column.sortKey && onSort ? (
                      <button type="button" className="flex items-center gap-1 font-semibold" onClick={() => onSort(column.sortKey as string)}>
                        {column.header}
                        <span aria-hidden="true">{sorted ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {loadingFirst
              ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {columns.map((column) => (
                      <td key={column.key} className={column.mobileHidden ? 'hidden sm:table-cell' : undefined}>
                        <div className="skeleton h-5 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)}>
                    {columns.map((column) => (
                      <td key={column.key} className={column.mobileHidden ? 'hidden sm:table-cell' : undefined}>
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {loadingFirst && (
        <p role="status" className="text-sm font-medium">
          Loading…
        </p>
      )}
    </div>
  )
}
