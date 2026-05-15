import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, UserX, UserCheck } from 'lucide-react'
import { useUsers, useUpdateUser } from '@/hooks/useUsers'
import { SearchInput } from '@/components/shared/SearchInput'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageShell } from '@/components/shared/PageShell'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/utils'
import type { User, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export default function StaffUsers() {
  const { params, goToPage } = usePagination()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useUsers(params)
  const update = useUpdateUser(toggleTarget?.id ?? 0)

  const pageData = data as Page<User> | undefined
  const allUsers: User[] = pageData?.content ?? []

  const filtered = allUsers.filter((u) => {
    const matchesSearch =
      !debouncedSearch ||
      u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.phoneNumber.includes(debouncedSearch)
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function handleToggleStatus() {
    if (!toggleTarget) return
    const newStatus = toggleTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    update.mutate(
      {
        name: toggleTarget.name,
        email: toggleTarget.email,
        phoneNumber: toggleTarget.phoneNumber,
        address: toggleTarget.address,
        membershipDate: toggleTarget.membershipDate,
        status: newStatus,
      },
      { onSuccess: () => setToggleTarget(null) },
    )
  }

  const columns: ColumnDef<User, unknown>[] = [
    {
      header: 'Name',
      id: 'name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { header: 'Phone', accessorKey: 'phoneNumber' },
    {
      header: 'Member Since',
      accessorKey: 'membershipDate',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex justify-end gap-2">
            <Link
              to={`/staff/users/${u.id}`}
              className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </Link>
            <button
              onClick={() => setToggleTarget(u)}
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium ${
                u.status === 'ACTIVE'
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {u.status === 'ACTIVE'
                ? <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                : <><UserCheck className="h-3.5 w-3.5" /> Activate</>
              }
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <PageShell
      title="Members"
      description={pageData ? `${pageData.totalElements} registered members` : ''}
    >
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or phone…"
          className="max-w-xs flex-1"
        />
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} />

      {pageData && (
        <Pagination
          page={pageData.number}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          size={pageData.size}
          onPageChange={goToPage}
        />
      )}

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.status === 'ACTIVE' ? 'Deactivate member' : 'Activate member'}
        description={
          toggleTarget?.status === 'ACTIVE'
            ? `Deactivate ${toggleTarget?.name}? They will no longer be able to log in.`
            : `Reactivate ${toggleTarget?.name}? They will regain access to their account.`
        }
        confirmLabel={toggleTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        loading={update.isPending}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />
    </PageShell>
  )
}
