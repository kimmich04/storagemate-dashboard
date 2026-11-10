import { useEffect, useState } from 'react'

/** Trả về `value` sau khi nó đứng yên `ms` mili giây (dùng cho ô tìm kiếm để không gọi API mỗi phím). */
export function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}
