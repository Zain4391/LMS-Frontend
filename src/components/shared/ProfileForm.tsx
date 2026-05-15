import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/schemas'
import { FormField, Input } from '@/components/shared/FormField'

// ─── Generic profile detail section ──────────────────────────────────────────

interface ProfileField {
  label: string
  value: string
}

export function ProfileCard({ fields }: { fields: ProfileField[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ─── Change password form ─────────────────────────────────────────────────────

interface ChangePasswordProps {
  onSubmit: (data: ChangePasswordFormValues) => void
  isPending: boolean
}

export function ChangePasswordForm({ onSubmit, isPending }: ChangePasswordProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema) as Resolver<ChangePasswordFormValues>,
  })

  function handleFormSubmit(data: ChangePasswordFormValues) {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormField label="Current Password" required error={errors.oldPassword?.message}>
        <Input type="password" {...register('oldPassword')} error={!!errors.oldPassword} autoComplete="current-password" />
      </FormField>
      <FormField label="New Password" required error={errors.newPassword?.message}>
        <Input type="password" {...register('newPassword')} error={!!errors.newPassword} autoComplete="new-password" />
      </FormField>
      <FormField label="Confirm New Password" required error={errors.confirmPassword?.message}>
        <Input type="password" {...register('confirmPassword')} error={!!errors.confirmPassword} autoComplete="new-password" />
      </FormField>
      <div className="pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </form>
  )
}
