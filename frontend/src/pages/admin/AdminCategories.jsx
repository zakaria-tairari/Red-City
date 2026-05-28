import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from '@/services/admin'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUIStore } from '@/store/useUIStore'

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', code: '' })

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAdminCategories,
  })

  const categories = response?.data ?? []

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminCategories'] })

  const createMutation = useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => {
      invalidate()
      setForm({ name: '', code: '' })
      addNotification({ type: 'success', message: 'Category created' })
    },
    onError: (err) => addNotification({ type: 'error', message: err.response?.data?.message || 'Create failed' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminCategory(id, data),
    onSuccess: () => {
      invalidate()
      setEditing(null)
      addNotification({ type: 'success', message: 'Category updated' })
    },
    onError: (err) => addNotification({ type: 'error', message: err.response?.data?.message || 'Update failed' }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      invalidate()
      addNotification({ type: 'success', message: 'Category deleted' })
    },
    onError: (err) => addNotification({ type: 'error', message: err.response?.data?.message || 'Delete failed' }),
  })

  const startEdit = (cat) => {
    setEditing(cat.id)
    setForm({ name: cat.name, code: cat.code })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editing ? 'Edit category' : 'Add category'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              if (editing) {
                updateMutation.mutate({ id: editing, data: form })
              } else {
                createMutation.mutate(form)
              }
            }}
          >
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-stone-700">Code</label>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Update' : 'Create'}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ name: '', code: '' }) }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTableCell header>Name</AdminTableCell>
              <AdminTableCell header>Code</AdminTableCell>
              <AdminTableCell header>Places</AdminTableCell>
              <AdminTableCell header className="text-right">Actions</AdminTableCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {categories.map((cat) => (
              <AdminTableRow key={cat.id}>
                <AdminTableCell className="font-medium">{cat.name}</AdminTableCell>
                <AdminTableCell className="font-mono text-stone-600">{cat.code}</AdminTableCell>
                <AdminTableCell>{cat.places_count ?? 0}</AdminTableCell>
                <AdminTableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => {
                        if (!window.confirm(`Delete category "${cat.name}"?`)) return
                        deleteMutation.mutate(cat.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  )
}
