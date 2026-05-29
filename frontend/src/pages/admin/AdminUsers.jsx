import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit2, Plus, Search, Shield, Trash2 } from 'lucide-react'
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser } from '@/services/admin'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { getApiErrorMessage } from '@/lib/admin'
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
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [pendingDelete, setPendingDelete] = useState(null)
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)
  const currentUser = useAuthStore((s) => s.user)

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
      setCreateOpen(false)
      addNotification({ type: 'success', message: 'User created and verified' })
    },
    onError: (err) => addNotification({
      type: 'error',
      message: getApiErrorMessage(err, 'Failed to create user'),
    }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setEditingUser(null)
      setEditForm(emptyForm)
      addNotification({ type: 'success', message: 'User updated' })
    },
    onError: (err) => addNotification({ type: 'error', message: getApiErrorMessage(err, 'Update failed') }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setPendingDelete(null)
      addNotification({ type: 'success', message: 'User deleted' })
    },
    onError: (err) => addNotification({ type: 'error', message: getApiErrorMessage(err, 'Delete failed') }),
  })

  const users = response?.data?.items ?? []
  const pagination = response?.data
  const openEditDialog = (user) => {
    setEditingUser(user)
    setEditForm({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      password: '',
      password_confirmation: '',
      role: user.role ?? 'user',
    })
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()

    if (!editingUser) return

    if (editForm.password && editForm.password !== editForm.password_confirmation) {
      addNotification({ type: 'error', message: 'Passwords do not match' })
      return
    }

    const payload = {
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      username: editForm.username.trim(),
      email: editForm.email.trim(),
      role: editForm.role,
    }

    if (editForm.password) {
      payload.password = editForm.password
      payload.password_confirmation = editForm.password_confirmation
    }

    updateMutation.mutate({ id: editingUser.id, data: payload })
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()

    if (form.password !== form.password_confirmation) {
      addNotification({ type: 'error', message: 'Passwords do not match' })
      return
    }

    createMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add user
        </Button>
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
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        title="Edit user"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        disabled={currentUser?.id === user.id}
                        onClick={() => setPendingDelete(user)}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="min-w-3xl">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
          </DialogHeader>
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleCreateSubmit}>
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
            <div className="sm:col-span-2">
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
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create user'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="min-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleEditSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">First name</label>
              <Input
                value={editForm.first_name}
                onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Last name</label>
              <Input
                value={editForm.last_name}
                onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Username</label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Password</label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                minLength={6}
                placeholder="Leave unchanged"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Confirm password</label>
              <Input
                type="password"
                value={editForm.password_confirmation}
                onChange={(e) => setEditForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                minLength={6}
                placeholder="Leave unchanged"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-stone-700">Role</label>
              <select
                className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm"
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {currentUser?.id === editingUser?.id && (
                <p className="mt-1 text-xs text-stone-500">You cannot remove your own admin role.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete user"
        message={pendingDelete ? `Delete ${pendingDelete.username}? This cannot be undone.` : ''}
        confirmLabel="Delete user"
        destructive
        confirming={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
      />
    </div>
  )
}
