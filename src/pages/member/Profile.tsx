import { useMyUser, useChangeMyUserPassword } from '@/hooks/useUsers'
import { PageShell } from '@/components/shared/PageShell'
import { ProfileCard, ChangePasswordForm } from '@/components/shared/ProfileForm'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { ChangePasswordFormValues } from '@/lib/schemas'

export default function MemberProfile() {
  const { data: member, isLoading } = useMyUser()
  const changePass = useChangeMyUserPassword()

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

  if (!member) return <p className="text-muted-foreground">Profile not found.</p>

  return (
    <PageShell title="My Profile">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Details */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Account Details</h2>
            <StatusBadge value={member.status} />
          </div>
          <ProfileCard
            fields={[
              { label: 'Name', value: member.name },
              { label: 'Email', value: member.email },
              { label: 'Phone', value: member.phoneNumber },
              { label: 'Address', value: member.address },
              { label: 'Member Since', value: formatDate(member.membershipDate) },
            ]}
          />
        </section>

        {/* Quick stats */}
        <section>
          <h2 className="mb-4 text-base font-semibold">Membership Info</h2>
          <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
            Member ID: <span className="font-mono font-medium text-foreground">#{member.id}</span>
            <span className="mx-3 text-border">·</span>
            Joined <span className="font-medium text-foreground">{formatDate(member.membershipDate)}</span>
          </div>
        </section>

        {/* Change password */}
        <section>
          <h2 className="mb-4 text-base font-semibold">Change Password</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ChangePasswordForm
              onSubmit={handleChangePassword}
              isPending={changePass.isPending}
            />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
