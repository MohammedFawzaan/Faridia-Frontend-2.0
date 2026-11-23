import { UserCog, UserPlus } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { UserFormModal } from '@/components/users/UserFormModal'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagedQuery } from '@/hooks/usePagedQuery'
import { usersService } from '@/services/usersService'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/stores/toastStore'
import type { SortOrder } from '@/types/api'
import type { UserRole } from '@/types/auth'
import type { StaffUser, UserListQuery, UserSortField } from '@/types/user'
import { initialsOf } from '@/utils/initials'
import { ROLE_LABELS } from '@/utils/roles'

type Dialog =
  | { type: 'create' }
  | { type: 'edit'; user: StaffUser }
  | { type: 'status'; user: StaffUser }
  | { type: 'reset'; user: StaffUser }
  | null

const PAGE_SIZE = 10
const ROLE_FILTER = (Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({ value: role, label: ROLE_LABELS[role] }))
const STATUS_FILTER = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function UsersPage() {
  const currentUserId = useAuthStore((state) => state.user?.id)
  const [searchText, setSearchText] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('')
  const [sortBy, setSortBy] = useState<UserSortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<Dialog>(null)

  const search = useDebounce(searchText.trim(), 500)
  const query = useMemo<UserListQuery>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      role: role || undefined,
      isActive: status ? status === 'active' : undefined,
      sortBy,
      sortOrder,
    }),
    [page, search, role, status, sortBy, sortOrder],
  )
  const { items, meta, status: queryStatus, error, reload } = usePagedQuery(usersService.list, query)
  const filtered = Boolean(search || role || status)

  const handleSort = (sortKey: string) => {
    if (sortKey === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(sortKey as UserSortField)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleFilter =
    <T,>(setter: (value: T) => void) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value as T)
      setPage(1)
    }

  const finish = (message: string) => {
    setDialog(null)
    toast.success(message)
    reload()
  }

  const columns: Column<StaffUser>[] = [
    {
      key: 'name',
      header: 'Name',
      sortKey: 'name',
      render: (user) => (
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 font-semibold text-secondary">
            {initialsOf(user.name)}
          </span>
          <div>
            <p className="font-semibold text-secondary">{user.name}</p>
            <p className="text-sm sm:hidden">{user.mobile}</p>
          </div>
        </div>
      ),
    },
    { key: 'mobile', header: 'Mobile', mobileHidden: true, render: (user) => user.mobile },
    { key: 'auth', header: 'Login id', mobileHidden: true, render: (user) => user.auth },
    {
      key: 'role',
      header: 'Role',
      sortKey: 'role',
      render: (user) => (
        <span className="badge badge-outline badge-primary font-semibold">{ROLE_LABELS[user.role]}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          {user.mustResetPassword && <span className="badge badge-warning">Password not set</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => {
        const isSelf = user.id === currentUserId
        return (
          <div className="flex flex-wrap gap-1">
            <Button variant="outline" className="btn-sm" onClick={() => setDialog({ type: 'edit', user })}>
              Edit
            </Button>
            <Button
              variant="outline"
              className="btn-sm"
              onClick={() => setDialog({ type: 'status', user })}
              disabled={isSelf && user.isActive}
              title={isSelf ? 'You cannot deactivate your own account' : undefined}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="outline"
              className="btn-sm"
              onClick={() => setDialog({ type: 'reset', user })}
              disabled={isSelf}
              title={isSelf ? 'Use change password for your own account' : undefined}
            >
              Reset password
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={UserCog}
        title="Users"
        description="Staff accounts, roles and passwords."
        actions={
          <Button onClick={() => setDialog({ type: 'create' })}>
            <UserPlus className="size-5" aria-hidden="true" />
            Add user
          </Button>
        }
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="Search"
            type="search"
            placeholder="Name, mobile number or login id"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value)
              setPage(1)
            }}
            hint={searchText.trim() !== search ? 'Searching…' : undefined}
          />
          <SelectField
            label="Role"
            placeholder="All roles"
            options={ROLE_FILTER}
            value={role}
            onChange={handleFilter(setRole)}
          />
          <SelectField
            label="Status"
            placeholder="All statuses"
            options={STATUS_FILTER}
            value={status}
            onChange={handleFilter(setStatus)}
          />
        </div>

        <DataTable
          columns={columns}
          rows={items}
          rowKey={(user) => user.id}
          status={queryStatus}
          errorMessage={error?.message}
          onRetry={reload}
          emptyTitle={filtered ? 'No users match your search' : 'No users yet'}
          emptyDescription={
            filtered ? 'Try a different search or clear the filters.' : 'Add the first staff user to get started.'
          }
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {meta && meta.total > 0 && (
          <Pagination meta={meta} disabled={queryStatus === 'loading'} onPageChange={setPage} />
        )}
      </Card>

      {dialog?.type === 'create' && (
        <UserFormModal onClose={() => setDialog(null)} onSaved={(user) => finish(`${user.name} was added`)} />
      )}
      {dialog?.type === 'edit' && (
        <UserFormModal
          user={dialog.user}
          isSelf={dialog.user.id === currentUserId}
          onClose={() => setDialog(null)}
          onSaved={(user) => finish(`${user.name} was updated`)}
        />
      )}
      {dialog?.type === 'status' && (
        <ConfirmDialog
          title={dialog.user.isActive ? 'Deactivate user' : 'Activate user'}
          message={
            dialog.user.isActive
              ? `${dialog.user.name} will no longer be able to sign in.`
              : `${dialog.user.name} will be able to sign in again.`
          }
          confirmLabel={dialog.user.isActive ? 'Deactivate' : 'Activate'}
          pendingLabel={dialog.user.isActive ? 'Deactivating…' : 'Activating…'}
          tone={dialog.user.isActive ? 'error' : 'primary'}
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            const updated = await usersService.setStatus(dialog.user.id, !dialog.user.isActive)
            finish(`${updated.name} is now ${updated.isActive ? 'active' : 'inactive'}`)
          }}
        />
      )}
      {dialog?.type === 'reset' && (
        <ConfirmDialog
          title="Reset password"
          message={`${dialog.user.name} will sign in with their mobile number and must set a new password.`}
          confirmLabel="Reset password"
          pendingLabel="Resetting…"
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            const updated = await usersService.resetPassword(dialog.user.id)
            finish(`Password reset for ${updated.name}`)
          }}
        />
      )}
    </div>
  )
}
