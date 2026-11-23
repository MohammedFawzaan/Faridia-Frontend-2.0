import { useCallback, useEffect, useState } from 'react'
import { toApiError, type ApiError } from '@/services/apiError'
import type { Page, PageMeta } from '@/types/api'

export type QueryStatus = 'loading' | 'success' | 'error'

interface Settled<T, Q> {
  query: Q
  reloadCount: number
  items: T[]
  meta: PageMeta | null
  error: ApiError | null
}

export const usePagedQuery = <T, Q>(fetcher: (query: Q) => Promise<Page<T>>, query: Q) => {
  const [settled, setSettled] = useState<Settled<T, Q> | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetcher(query)
      .then((page) => {
        if (!cancelled) setSettled({ query, reloadCount, items: page.items, meta: page.meta, error: null })
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setSettled((current) => ({
            query,
            reloadCount,
            items: current?.items ?? [],
            meta: current?.meta ?? null,
            error: toApiError(error),
          }))
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, query, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  const upToDate = settled !== null && settled.query === query && settled.reloadCount === reloadCount
  const status: QueryStatus = !upToDate ? 'loading' : settled.error ? 'error' : 'success'

  return {
    items: settled?.items ?? [],
    meta: settled?.meta ?? null,
    status,
    error: upToDate ? settled.error : null,
    reload,
  }
}
