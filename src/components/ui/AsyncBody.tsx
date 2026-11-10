import type { ReactNode } from 'react'
import type { AsyncState } from '../../lib/useAsync'
import { ErrorCard } from './ErrorCard'
import { Skeleton } from './Skeleton'

interface Props<T> {
  state: AsyncState<T>
  skeletonClass?: string
  children: (data: T) => ReactNode
}

/** Thân thẻ tự tải: lỗi → ErrorCard, chưa có dữ liệu → skeleton, có → render. */
export function AsyncBody<T>({ state, skeletonClass = 'h-[160px]', children }: Props<T>) {
  if (state.data !== undefined) return <>{children(state.data)}</>
  if (state.error) return <ErrorCard message={state.error.message} onRetry={state.reload} />
  return <Skeleton className={skeletonClass} />
}
