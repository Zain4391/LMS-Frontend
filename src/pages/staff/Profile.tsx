import { useMyLibrarian, useChangeMyLibrarianPassword } from '@/hooks/useLibrarians'
import { PageShell } from '@/components/shared/PageShell'
import { ProfileCard, ChangePasswordForm } from '@/components/shared/ProfileForm'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { ChangePasswordFormValues } from '@/lib/schemas'

export default function StaffProfile() {
  const { data: librarian, isLoading } = useMyLibrarian()
  const changePass = useChangeMyLibrarianPassword()

  function handleChangePassword(data: ChangePasswordFormValues) {
    changePass.mutate({ oldPassword: data.oldPassword, newPassword: data.newPassword })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  if (!librarian) return <p className="text-muted-foreground">Profile not found.</p>

  return (
    <PageShell title="My Profile">
      <div className="mx-auto max-w-2xl space-y-8">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Account Details</h2>
            <StatusBadge value={librarian.role} />
          </div>
          <ProfileCard
            fields={[
              { label: 'Name', value: librarian.name },
              { label: 'Email', value: librarian.email },
              { label: 'Phone', value: librarian.phoneNumber },
              { label: 'Address', value: librarian.address },
              { label: 'Hire Date', value: formatDate(librarian.hireDate) },
              { label: 'Status', value: librarian.status },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-4 text-base font-semibold">Change Password</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ChangePasswordForm onSubmit={handleChangePassword} isPending={changePass.isPending} />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
