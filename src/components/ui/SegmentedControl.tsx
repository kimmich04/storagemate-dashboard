import { cn } from '../../lib/cn'

interface Option<T extends string | number> {
  value: T
  label: string
}

interface Props<T extends string | number> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
}

export function SegmentedControl<T extends string | number>({ label, options, value, onChange }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex gap-0.5 rounded-[10px] bg-seg p-[3px]">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-9 rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold',
              on ? 'bg-surface text-ink' : 'bg-transparent text-muted hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
