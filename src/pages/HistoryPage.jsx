import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Printer, Eye, Receipt, Calendar, CheckCircle, Clock } from 'lucide-react'
import { salesApi, staffApi } from '@/lib/api'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Spinner, EmptyState, StatusBadge } from '@/components/ui'
import toast from 'react-hot-toast'

function normalizePaid(sale) {
  if (sale?.isPaid === true || sale?.isPaid === false) return sale.isPaid
  if (sale?.status === 'paid') return true
  if (sale?.status === 'unpaid') return false
  return null
}

function getStaffLabel(sale) {
  const asLabel = (val) => {
    if (val === null || val === undefined) return null
    if (typeof val === 'string' || typeof val === 'number') return String(val)
    if (typeof val === 'object') {
      return (
        val.fullName ??
        val.fullname ??
        val.name ??
        val.staffName ??
        val.staffId ??
        val.StaffId ??
        null
      )
    }
    return null
  }

  const staff = sale?.staff ?? sale?.attendant ?? sale?.staffInfo ?? sale?.servedBy
  if (staff && typeof staff === 'object') {
    return asLabel(staff) ?? '—'
  }
  return (
    asLabel(sale?.staffName) ??
    asLabel(sale?.staffFullName) ??
    asLabel(sale?.staffId) ??
    '—'
  )
}

function formatPaymentMethod(method) {
  if (!method) return 'â€”'
  if (Array.isArray(method)) {
    return method.map((m) => {
      if (!m) return null
      if (typeof m === 'string' || typeof m === 'number') return String(m)
      if (typeof m === 'object') return m.method ?? m.name ?? m.type ?? 'â€”'
      return null
    }).filter(Boolean).join(' + ') || 'â€”'
  }
  if (typeof method === 'string' || typeof method === 'number') return String(method)
  if (typeof method === 'object') return method.method ?? method.name ?? method.type ?? 'â€”'
  return 'â€”'
}

function ReceiptModal({ saleId, onClose }) {
  const { data: html, isLoading, isError } = useQuery({
    queryKey: ['receipt', saleId],
    queryFn:  () => salesApi.receipt(saleId).then((r) => r.data),
    enabled:  !!saleId,
  })

  const handlePrint = () => {
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg shadow-panel animate-fade-up flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[rgba(212,168,83,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-receipt-gold" />
            <h3 className="font-display text-lg text-white">Receipt Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} disabled={isLoading || isError} className="btn-ghost py-2 px-3 text-xs">
              <Printer size={13} />
              Print
            </button>
            <button onClick={onClose} className="text-obsidian-500 hover:text-white text-lg">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-white rounded-b-xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Spinner /></div>
          ) : isError ? (
            <p className="text-center text-red-400 py-10 text-sm">Failed to load receipt</p>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: html }}
              className="text-black"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SaleDetailsModal({ sale, onClose, onTogglePaid, toggling }) {
  if (!sale) return null
  const isPaid = normalizePaid(sale)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-2xl shadow-panel animate-fade-up flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[rgba(212,168,83,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-receipt-gold" />
            <h3 className="font-display text-lg text-white">Sale Details</h3>
          </div>
          <button onClick={onClose} className="text-obsidian-500 hover:text-white text-lg">×</button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Customer</p>
              <p className="text-sm text-obsidian-100">{sale.customerName || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Date</p>
              <p className="text-sm text-obsidian-100">{formatDate(sale.createdAt)} · {formatTime(sale.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Payment</p>
              {Array.isArray(sale.paymentMethod) ? (
                <div className="space-y-1">
                  {sale.paymentMethod.map((pm) => (
                    <p key={pm._id ?? pm.method ?? pm.name ?? pm.type} className="text-sm text-obsidian-100">
                      {pm.method ?? pm.name ?? pm.type ?? '—'} · {formatCurrency(pm.amount ?? pm.value ?? 0)}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-obsidian-100">{formatPaymentMethod(sale.paymentMethod)}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Staff</p>
              <p className="text-sm text-obsidian-100">{getStaffLabel(sale)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Total</p>
              <p className="text-sm font-mono text-receipt-gold font-semibold">
                {formatCurrency(sale.totalAmount ?? sale.total)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-2">Status</p>
            <div className="flex items-center gap-3">
              <StatusBadge status={sale.status ?? sale.isPaid} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTogglePaid(true)}
                  disabled={toggling}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isPaid === true
                      ? 'border-green-600/40 bg-green-900/20 text-green-400'
                      : 'border-obsidian-700 text-obsidian-500 hover:border-obsidian-600'
                  }`}
                >
                  <CheckCircle size={13} />
                  Paid
                </button>
                <button
                  onClick={() => onTogglePaid(false)}
                  disabled={toggling}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isPaid === false
                      ? 'border-amber-600/40 bg-amber-900/20 text-amber-400'
                      : 'border-obsidian-700 text-obsidian-500 hover:border-obsidian-600'
                  }`}
                >
                  <Clock size={13} />
                  Unpaid
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-2">Items</p>
            {sale.items?.length ? (
              <div className="space-y-2">
                {sale.items.map((item, idx) => {
                  const product = item.product && typeof item.product === 'object'
                    ? item.product
                    : { name: item.name ?? item.productName ?? 'Item', price: item.price }
                  const productName = product.name ?? item.name ?? item.productName ?? 'Item'
                  const productPrice = item.price ?? product.price ?? 0

                  return (
                    <div key={item._id ?? item.product ?? idx} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="text-obsidian-200 truncate">{productName}</p>
                        <p className="text-xs text-obsidian-500 font-mono">x{item.quantity ?? 1}</p>
                      </div>
                      <p className="text-xs font-mono text-obsidian-400">
                        {formatCurrency(productPrice)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-obsidian-500">No items found for this sale.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EodModal({ open, onClose, data, isLoading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg shadow-panel animate-fade-up flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[rgba(212,168,83,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-receipt-gold" />
            <h3 className="font-display text-lg text-white">End of Day Summary</h3>
          </div>
          <button onClick={onClose} className="text-obsidian-500 hover:text-white text-lg">×</button>
        </div>
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Spinner size={24} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Gross Sales</p>
                  <p className="text-lg font-mono text-receipt-gold font-semibold">
                    {formatCurrency(data?.grossSales ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Transactions</p>
                  <p className="text-lg text-obsidian-100">{data?.count ?? 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Paid</p>
                  <p className="text-sm text-obsidian-100">{data?.paid?.count ?? 0} tx</p>
                  <p className="text-sm font-mono text-receipt-gold">{formatCurrency(data?.paid?.amount ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-1">Unpaid</p>
                  <p className="text-sm text-obsidian-100">{data?.unpaid?.count ?? 0} tx</p>
                  <p className="text-sm font-mono text-receipt-gold">{formatCurrency(data?.unpaid?.amount ?? 0)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-2">Payment Methods</p>
                <div className="space-y-2">
                  {Object.entries(data?.paymentMethodBreakdown ?? {}).map(([method, info]) => (
                    <div key={method} className="flex items-center justify-between text-sm">
                      <p className="text-obsidian-200">{method}</p>
                      <p className="text-xs font-mono text-receipt-gold">
                       {formatCurrency(info?.amount ?? 0)}
                      </p>
                    </div>
                  ))}
                  {(!data?.paymentMethodBreakdown || Object.keys(data.paymentMethodBreakdown).length === 0) && (
                    <p className="text-sm text-obsidian-500">No payment breakdown available.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-2">Products Sold</p>
                {data?.productsSold?.length ? (
                  <div className="space-y-2">
                    {data.productsSold.map((product) => (
                      <div key={product.productId ?? product.name} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center text-sm bg-white/5 rounded-lg p-3">
                        <div>
                          <p className="text-obsidian-200 truncate">{product.name}</p>
                          {/* <p className="text-xs text-obsidian-500 font-mono">ID: {product.productId}</p> */}
                        </div>
                        <p className="text-xs text-obsidian-400">{product.count}</p>
                        <p className="text-xs font-mono text-receipt-gold">{formatCurrency(product.amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-obsidian-500">No products sold recorded.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const qc = useQueryClient()
  const [search,      setSearch]      = useState('')
  const [dateFilter,  setDateFilter]  = useState(() => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })
  const [staffFilter, setStaffFilter] = useState('')
  const [viewReceipt, setViewReceipt] = useState(null)
  const [viewSale,    setViewSale]    = useState(null)
  const [showEod,     setShowEod]     = useState(false)

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn:  () => staffApi.list().then((r) => {
      const data = r.data
      return Array.isArray(data) ? data : data?.staff ?? data?.data ?? []
    }),
  })

  const { data: sales = [], isLoading, refetch } = useQuery({
    queryKey: ['sales', dateFilter, staffFilter],
    queryFn:  () => salesApi.daily({ date: dateFilter, staffId: staffFilter || undefined }).then((r) => {
      const data = r.data
      return Array.isArray(data) ? data : data?.sales ?? data?.data ?? []
    }),
  })

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['sales-search', search],
    queryFn:  () => salesApi.searchCustomer(search).then((r) => {
      const data = r.data
      return Array.isArray(data) ? data : data?.sales ?? data?.data ?? []
    }),
    enabled:  search.length >= 2,
  })

  const displaySales = search.length >= 2 ? (searchResults ?? []) : sales

  const { mutate: togglePaid, isPending: toggling } = useMutation({
    mutationFn: ({ id, isPaid }) => salesApi.update(id, { isPaid }),
    onSuccess: (_, vars) => {
      setViewSale((prev) => (prev ? { ...prev, isPaid: vars.isPaid, status: vars.isPaid ? 'paid' : 'unpaid' } : prev))
      qc.invalidateQueries({ queryKey: ['sales', dateFilter, staffFilter] })
      qc.invalidateQueries({ queryKey: ['sales-eod'] })
      toast.success('Sale status updated')
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Failed to update sale'),
  })

  const { data: eod, isLoading: eodLoading, refetch: refetchEod } = useQuery({
    queryKey: ['sales-eod', dateFilter],
    queryFn:  () => salesApi.eod({ date: dateFilter }).then((r) => r.data),
    enabled:  false,
  })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="font-display text-2xl text-white">Sales History</h1>
          <p className="text-sm text-obsidian-400 mt-0.5">View and print past receipts</p>
        </div>
      </div>
      <div className="page-divider" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name…"
            className="field pl-9"
          />
        </div>
        <div className="relative">
          <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-500" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setSearch('') }}
            className="field pl-9 w-full sm:w-auto"
          />
        </div>
        <div className="relative">
          <select
            value={staffFilter}
            onChange={(e) => { setStaffFilter(e.target.value); setSearch('') }}
            className="field w-full sm:w-auto"
          >
            <option value="">All staff</option>
            {staff.map((s) => (
              <option key={s._id ?? s.id} value={s._id ?? s.id}>
                {s.fullName ?? s.fullname ?? s.name ?? 'Staff'}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setShowEod(true); refetchEod() }}
          className="btn-ghost w-full sm:w-auto justify-center px-4"
        >
          View End of Day
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {(isLoading || searchLoading) ? (
          <div className="flex items-center justify-center h-40"><Spinner size={24} /></div>
        ) : displaySales.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No sales found"
            description={search ? 'No customers matching that name' : 'No sales recorded for this date'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[rgba(212,168,83,0.1)]">
                <tr>
                  <th className="th-base">Time</th>
                  <th className="th-base">Customer</th>
                  <th className="th-base">Staff</th>
                  <th className="th-base">Items</th>
                  <th className="th-base">Payment</th>
                  <th className="th-base">Amount</th>
                  <th className="th-base">Status</th>
                  <th className="th-base"></th>
                </tr>
              </thead>
              <tbody>
                {displaySales.map((sale) => (
                  <tr
                    key={sale._id}
                    className="tr-base cursor-pointer"
                    onClick={() => setViewSale(sale)}
                  >
                    <td className="td-base font-mono text-xs text-obsidian-400">
                      {formatTime(sale.createdAt)}
                    </td>
                    <td className="td-base font-medium text-obsidian-100">
                      {sale.customerName || '—'}
                    </td>
                    <td className="td-base text-obsidian-400">
                      {getStaffLabel(sale)}
                    </td>
                    <td className="td-base text-obsidian-400">
                      {sale.items?.length ?? 0} item{sale.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="td-base">
                      <span className="font-mono text-xs text-obsidian-400">{formatPaymentMethod(sale.paymentMethod)}</span>
                    </td>
                    <td className="td-base font-mono text-receipt-gold font-semibold">
                      {formatCurrency(sale.totalAmount ?? sale.total)}
                    </td>
                    <td className="td-base">
                      <StatusBadge status={sale.status ?? sale.isPaid} />
                    </td>
                    <td className="td-base">
                      <button
                        onClick={(e) => { e.stopPropagation(); setViewReceipt(sale._id) }}
                        className="flex items-center gap-1.5 text-xs text-obsidian-500 hover:text-receipt-gold transition-colors"
                      >
                        <Eye size={13} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt modal */}
      {viewReceipt && (
        <ReceiptModal saleId={viewReceipt} onClose={() => setViewReceipt(null)} />
      )}

      {viewSale && (
        <SaleDetailsModal
          sale={viewSale}
          onClose={() => setViewSale(null)}
          onTogglePaid={(val) => togglePaid({ id: viewSale._id, isPaid: val })}
          toggling={toggling}
        />
      )}

      <EodModal
        open={showEod}
        onClose={() => setShowEod(false)}
        data={eod}
        isLoading={eodLoading}
      />
    </div>
  )
}

