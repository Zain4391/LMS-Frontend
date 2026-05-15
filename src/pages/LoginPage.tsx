import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/lib/schemas'
import { useLoginUser, useLoginLibrarian } from '@/hooks/useAuthMutations'

export default function LoginPage() {
  const [portalType, setPortalType] = useState<'member' | 'staff'>('member')

  const loginUser = useLoginUser()
  const loginLibrarian = useLoginLibrarian()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const isPending = loginUser.isPending || loginLibrarian.isPending

  function onSubmit(data: LoginFormValues) {
    if (portalType === 'member') loginUser.mutate(data)
    else loginLibrarian.mutate(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        </div>

        {/* Portal toggle */}
        <div className="mb-6 flex rounded-lg border border-border p-1">
          {(['member', 'staff'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPortalType(t)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                portalType === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'member' ? 'Member' : 'Staff'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {portalType === 'member' && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
