import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
            <h2 className="font-semibold">Something went wrong</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{this.state.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
