import type { ReactNode } from 'react'

interface Props {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, error, required, children }: Props) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
        error ? 'border-destructive' : 'border-input'
      } bg-background ${className}`}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
        error ? 'border-destructive' : 'border-input'
      } bg-background ${className}`}
    >
      {children}
    </select>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${
        error ? 'border-destructive' : 'border-input'
      } bg-background ${className}`}
    />
  )
}
