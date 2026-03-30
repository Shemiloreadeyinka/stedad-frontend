import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, ToggleLeft, ToggleRight, Trash2, Pencil } from 'lucide-react'
import { staffApi } from '@/lib/api'
import { getErrorMessage, ROLES } from '@/lib/utils'
import {
  Spinner, EmptyState, Modal, ConfirmDialog, FormField, Select,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const EMPTY_FORM = { fullName: '', staffId: '', role: 'Cashier', password: '' }

function StaffModal({ open, onClose, existing }) {
  const qc = useQueryClient()
  const isEdit = !!existing  

  const [form, setForm] = useState(existing ?? EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      isEdit
        ? staffApi.update(existing._id, { fullName: form.fullName, role: form.role })
        : staffApi.create(form),
    onSuccess: () => {
      toast.success(isEdit ? 'Staff updated' : 'Staff created')
      qc.invalidateQueries({ queryKey: ['staff'] })
      onClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Required'
    if (!isEdit && !form.staffId.trim()) e.staffId = 'Required'
    if (!isEdit && !form.password.trim()) e.password = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => { if (validate()) mutate() }
  const set = (k) => (e) => { setErrors((v) => ({ ...v, [k]: '' })); setForm((f) => ({ ...f, [k]: e.target.value })) }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Staff Member' : 'Add Staff Member'}>
      <div className="space-y-4">
        <FormField label="Full Name" error={errors.fullName}>
          <input value={form.fullName} onChange={set('fullName')} placeholder="Ada Okonkwo" className="field" />
        </FormField>

        {!isEdit && (
          <FormField label="Staff ID" error={errors.staffId}>
            <input value={form.staffId} onChange={set('staffId')} placeholder="STF-001" className="field font-mono" />
          </FormField>
        )}

        <FormField label="Role">
          <Select value={form.role} onChange={set('role')}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </FormField>

        {!isEdit && (
          <FormField label="Password" error={errors.password}>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" className="field" />
          </FormField>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner size={14} /> : null}
            {isEdit ? 'Save Changes' : 'Create Staff'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

const ROLE_BADGE = {
  Admin:   'bg-purple-900/30 text-purple-400 border-purple-800/40',
  Manager: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  Cashier: 'bg-obsidian-800/60 text-obsidian-400 border-obsidian-700/40',
}

export default function StaffPage() {
  const qc = useQueryClient()
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn:  () => staffApi.list().then((r) => {
      const data = r.data
      return Array.isArray(data) ? data : data?.staff ?? data?.data ?? []
    }),
  })

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (id) => staffApi.toggleStatus(id),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['staff'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { mutate: deleteStaff, isPending: deleting } = useMutation({
    mutationFn: () => staffApi.delete(deleteTarget._id),
    onSuccess: () => {
      toast.success('Staff member removed')
      qc.invalidateQueries({ queryKey: ['staff'] })
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (s)  => { setEditTarget(s);   setModalOpen(true) }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="font-display text-2xl text-white">Staff Management</h1>
          <p className="text-sm text-obsidian-400 mt-0.5">{staff.length} staff member{staff.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={15} />
          Add Staff
        </button>
      </div>
      <div className="page-divider" />

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Spinner size={24} /></div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff members yet"
          action={<button className="btn-primary" onClick={openCreate}><Plus size={14} />Add first staff</button>}
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[rgba(212,168,83,0.1)]">
                <tr>
                  <th className="th-base">Name</th>
                  <th className="th-base">Staff ID</th>
                  <th className="th-base">Role</th>
                  <th className="th-base">Status</th>
                  <th className="th-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s._id} className="tr-base">
                    <td className="td-base font-medium text-obsidian-100">{s.fullName ?? s.fullname ?? s.name ?? '—'}</td>
                    <td className="td-base font-mono text-xs text-obsidian-400">{s.staffId ?? s.StaffId ?? '—'}</td>
                    <td className="td-base">
                      <span className={cn('inline-flex items-center text-xs font-mono px-2 py-0.5 rounded-full border', ROLE_BADGE[s.role] ?? ROLE_BADGE.Cashier)}>
                        {s.role}
                      </span>
                    </td>
                    <td className="td-base">
                      <button
                        onClick={() => toggleStatus(s._id)}
                        className={cn(
                          'flex items-center gap-1.5 text-xs font-medium transition-colors',
                          s.status === 'Active' || s.isActive ? 'text-green-400 hover:text-green-300' : 'text-obsidian-500 hover:text-obsidian-400',
                        )}
                      >
                        {s.status === 'Active' || s.isActive
                          ? <ToggleRight size={18} />
                          : <ToggleLeft size={18} />}
                        {s.status ?? (s.isActive ? 'Active' : 'Inactive')}
                      </button>
                    </td>
                    <td className="td-base">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="text-obsidian-500 hover:text-receipt-gold transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="text-obsidian-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <StaffModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditTarget(null) }}
          existing={editTarget}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteStaff}
        loading={deleting}
        title="Remove Staff Member"
        description={`Are you sure you want to remove ${deleteTarget?.fullName}? This cannot be undone.`}
      />
    </div>
  )
}
