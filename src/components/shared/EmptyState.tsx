import type { ReactNode, ElementType } from 'react'
import { Inbox } from 'lucide-react'

interface Props {
  icon?: ElementType
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      {description && <p className="mb-4 max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
