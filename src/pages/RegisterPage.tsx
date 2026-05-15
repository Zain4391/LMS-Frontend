import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { registerSchema, type RegisterFormValues } from '@/lib/schemas'
import { useRegister } from '@/hooks/useAuthMutations'

export default function RegisterPage() {
  const { mutate, isPending } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { membershipDate: new Date().toISOString().split('T')[0] },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
          {(
            [
              { name: 'name', label: 'Full name', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'password', label: 'Password', type: 'password' },
              { name: 'phoneNumber', label: 'Phone number', type: 'tel' },
              { name: 'address', label: 'Address', type: 'text' },
              { name: 'membershipDate', label: 'Membership start date', type: 'date' },
            ] as const
          ).map(({ name, label, type }) => (
            <div key={name}>
              <label className="mb-1 block text-sm font-medium">{label}</label>
              <input
                {...register(name)}
                type={type}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {errors[name] && (
                <p className="mt-1 text-xs text-destructive">{errors[name]?.message}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
