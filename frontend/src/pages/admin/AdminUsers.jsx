import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Shield } from 'lucide-react'
import { createAdminUser, getAdminUsers, updateAdminUserRole } from '@/services/admin'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

const emptyForm = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'user',
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminUsers', search, roleFilter, page],
    queryFn: () => getAdminUsers({
      search: search || undefined,
      role: roleFilter || undefined,
      page,
    }),
  })

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setForm(emptyForm)
      addNotification({ type: 'success', message: 'User created and verified' })
    },
    onError: (err) => addNotification({
      type: 'error',
      message: err.response?.data?.message || 'Failed to create user',
    }),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => updateAdminUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      addNotification({ type: 'success', message: 'Role updated' })
    },
    onError: (err) => addNotification({ type: 'error', message: err.response?.data?.message || 'Update failed' }),
  })

  const users = response?.data?.items ?? []
  const pagination = response?.data

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add user
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (form.password !== form.password_confirmation) {
                addNotification({ type: 'error', message: 'Passwords do not match' })
                return
              }
              createMutation.mutate(form)
            }}
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">First name</label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Last name</label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Username</label>
              <Input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Password</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Confirm password</label>
              <Input
                type="password"
                value={form.password_confirmation}
                onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Role</label>
              <select
                className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create user'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            className="pl-10"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="h-10 rounded-xl border border-stone-200 bg-white px-4 text-sm"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
        >
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTableCell header>User</AdminTableCell>
                <AdminTableCell header>Email</AdminTableCell>
                <AdminTableCell header>Status</AdminTableCell>
                <AdminTableCell header>Role</AdminTableCell>
                <AdminTableCell header>Activity</AdminTableCell>
                <AdminTableCell header className="text-right">Actions</AdminTableCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {users.map((user) => (
                <AdminTableRow key={user.id}>
                  <AdminTableCell>
                    <p className="font-medium text-stone-900">{user.username}</p>
                    <p className="text-xs text-stone-500">{user.first_name} {user.last_name}</p>
                  </AdminTableCell>
                  <AdminTableCell className="text-stone-600">{user.email}</AdminTableCell>
                  <AdminTableCell>
                    <span className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      user.email_verified_at
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    )}>
                      {user.email_verified_at ? 'Verified' : 'Pending'}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      user.role === 'admin' ? 'bg-primary-100 text-primary-800' : 'bg-stone-100 text-stone-600'
                    )}>
                      {user.role === 'admin' && <Shield className="h-3 w-3" />}
                      {user.role}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="text-stone-500 text-xs">
                    {user.reviews_count ?? 0} reviews · {user.favorite_places_count ?? 0} favorites
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={roleMutation.isPending}
                      onClick={() => roleMutation.mutate({
                        id: user.id,
                        role: user.role === 'admin' ? 'user' : 'admin',
                      })}
                    >
                      {user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                    </Button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">Page {pagination.current_page} of {pagination.last_page}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
