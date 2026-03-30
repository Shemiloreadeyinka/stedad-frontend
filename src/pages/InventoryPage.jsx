import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Package, Search, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { productsApi } from '@/lib/api'
import { formatCurrency, getErrorMessage, isLowStock, LOW_STOCK_LIMIT } from '@/lib/utils'
import {
  Spinner, EmptyState, Modal, ConfirmDialog, FormField,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', price: '', quantityLeft: '' }

function ProductModal({ open, onClose, existing }) {
  const qc     = useQueryClient()
  const isEdit = !!existing

  const [form,   setForm]   = useState(existing ? {
    name:         existing.name,
    price:        String(existing.price),
    quantityLeft: String(existing.quantityLeft),
  } : EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        name:         form.name.trim(),
        price:        Number(form.price),
        quantityLeft: Number(form.quantityLeft),
      }
      return isEdit
        ? productsApi.update(existing._id, payload)
        : productsApi.create(payload)
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated' : 'Product added')
      qc.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const validate = () => {
    const e = {}
    if (!form.name.trim())              e.name         = 'Required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                        e.price        = 'Enter a valid price'
    if (form.quantityLeft === '' || isNaN(Number(form.quantityLeft)) || Number(form.quantityLeft) < 0)
                                        e.quantityLeft = 'Enter a valid quantity'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => { if (validate()) mutate() }
  const set = (k) => (e) => {
    setErrors((v) => ({ ...v, [k]: '' }))
    setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'}>
      <div className="space-y-4">
        <FormField label="Product Name" error={errors.name}>
          <input value={form.name} onChange={set('name')} placeholder="e.g. Indomie Noodles" className="field" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Price (₦)" error={errors.price}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              placeholder="0.00"
              className="field font-mono"
            />
          </FormField>
          <FormField label="Quantity in Stock" error={errors.quantityLeft}>
            <input
              type="number"
              min="0"
              value={form.quantityLeft}
              onChange={set('quantityLeft')}
              placeholder="0"
              className="field font-mono"
            />
          </FormField>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner size={14} /> : null}
            {isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function StockBar({ qty, max = 20 }) {
  const pct  = Math.min(100, (qty / max) * 100)
  const low  = isLowStock(qty)
  const zero = qty === 0
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full bg-obsidian-800 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            zero ? 'bg-red-600' : low ? 'bg-orange-500' : 'bg-green-600',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        'font-mono text-xs w-8 text-right',
        zero ? 'text-red-400' : low ? 'text-orange-400' : 'text-obsidian-400',
      )}>
        {qty}
      </span>
    </div>
  )
}

export default function InventoryPage() {
  const qc = useQueryClient()
  const [search,       setSearch]       = useState('')
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn:  () => productsApi.list().then((r) => {
      const data = r.data
      return Array.isArray(data) ? data : data?.products ?? data?.data ?? []
    }),
  })

  const { mutate: deleteProduct, isPending: deleting } = useMutation({
    mutationFn: () => productsApi.delete(deleteTarget._id),
    onSuccess: () => {
      toast.success('Product deleted')
      qc.invalidateQueries({ queryKey: ['products'] })
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const filtered = useMemo(() => {
    if (!search) return products
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    )
  }, [products, search])

  const lowCount = products.filter((p) => isLowStock(p.quantityLeft)).length

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (p) => { setEditTarget(p);   setModalOpen(true) }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="font-display text-2xl text-white">Inventory</h1>
          <p className="text-sm text-obsidian-400 mt-0.5">
            {products.length} products
            {lowCount > 0 && (
              <span className="ml-2 text-orange-400">
                · {lowCount} low stock
              </span>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={15} />
          Add Product
        </button>
      </div>
      <div className="page-divider" />

      {/* Low stock alert banner */}
      {!isLoading && lowCount > 0 && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-orange-900/15 border border-orange-800/30 text-sm text-orange-300">
          <AlertTriangle size={15} className="text-orange-400 shrink-0" />
          <span>
            <strong>{lowCount}</strong> product{lowCount > 1 ? 's are' : ' is'} running low (≤{LOW_STOCK_LIMIT} units). Restock soon.
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="field pl-9"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search ? 'No products found' : 'No products yet'}
          description={search ? 'Try a different search' : 'Add your first product to get started'}
          action={!search && (
            <button className="btn-primary" onClick={openCreate}><Plus size={14} />Add Product</button>
          )}
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[rgba(212,168,83,0.1)]">
                <tr>
                  <th className="th-base">Product</th>
                  <th className="th-base">Price</th>
                  <th className="th-base w-40">Stock Level</th>
                  <th className="th-base">Status</th>
                  <th className="th-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const low  = isLowStock(p.quantityLeft)
                  const zero = p.quantityLeft === 0
                  return (
                    <tr key={p._id} className="tr-base">
                      <td className="td-base font-medium text-obsidian-100">{p.name}</td>
                      <td className="td-base font-mono text-receipt-gold">{formatCurrency(p.price)}</td>
                      <td className="td-base w-40">
                        <StockBar qty={p.quantityLeft} />
                      </td>
                      <td className="td-base">
                        {zero
                          ? <span className="badge-low text-red-400">Out of stock</span>
                          : low
                            ? <span className="badge-low">Low stock</span>
                            : <span className="badge-paid">In stock</span>
                        }
                      </td>
                      <td className="td-base">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="text-obsidian-500 hover:text-receipt-gold transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(p)} className="text-obsidian-500 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <ProductModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditTarget(null) }}
          existing={editTarget}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteProduct}
        loading={deleting}
        title="Delete Product"
        description={`Delete "${deleteTarget?.name}"? This will remove it from inventory permanently.`}
      />
    </div>
  )
}
