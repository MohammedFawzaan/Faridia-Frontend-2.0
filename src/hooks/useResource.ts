import { useCallback, useEffect, useState } from 'react'
import { toApiError, type ApiError } from '@/services/apiError'

export type ResourceStatus = 'loading' | 'success' | 'error'

interface Settled<T, A> {
  argument: A
  reloadCount: number
  data: T | null
  error: ApiError | null
}

export const useResource = <T, A>(fetcher: (argument: A) => Promise<T>, argument: A) => {
  const [settled, setSettled] = useState<Settled<T, A> | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetcher(argument)
      .then((data) => {
        if (!cancelled) setSettled({ argument, reloadCount, data, error: null })
      })
      .catch((error: unknown) => {
        if (!cancelled) setSettled({ argument, reloadCount, data: null, error: toApiError(error) })
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, argument, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  const upToDate = settled !== null && settled.argument === argument && settled.reloadCount === reloadCount
  const status: ResourceStatus = !upToDate ? 'loading' : settled.error ? 'error' : 'success'

  return { data: upToDate ? settled.data : null, status, error: upToDate ? settled.error : null, reload }
}
