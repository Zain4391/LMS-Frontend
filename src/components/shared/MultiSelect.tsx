import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface Option {
  value: number
  label: string
}

interface Props {
  options: Option[]
  value: number[]
  onChange: (v: number[]) => void
  placeholder?: string
  error?: string
}

export function MultiSelect({ options, value, onChange, placeholder = 'Select…', error }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  const selected = options.filter((o) => value.includes(o.value))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-left ${
          error ? 'border-destructive' : 'border-input'
        } bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          selected.map((o) => (
            <span
              key={o.value}
              className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs"
            >
              {o.label}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggle(o.value) }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-card shadow-md">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No options</p>
          ) : (
            options.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={value.includes(o.value)}
                  onChange={() => toggle(o.value)}
                  className="accent-primary"
                />
                {o.label}
              </label>
            ))
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
