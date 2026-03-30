import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Search, Plus, Minus, Trash2, ShoppingCart,
  CreditCard, Banknote, Smartphone, CheckCircle, Clock,
} from 'lucide-react'
import { salesApi, productsApi } from '@/lib/api'
import { useCart } from '@/store/cart'
import { useAuth } from '@/store/auth'
import { formatCurrency, getErrorMessage, PAYMENT_METHODS, isLowStock } from '@/lib/utils'
import { Spinner, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const PAYMENT_ICONS = {
  Cash:     Banknote,
  Transfer: Smartphone,
  POS:      CreditCard,
}


function ProductCard({ product, onAdd, inCart }) {
  const low = isLowStock(product.quantityLeft)
  const oos = product.quantityLeft === 0

  return (
    <button
      onClick={() => !oos && onAdd(product)}
      disabled={oos}
      className={cn(
        'group relative text-left rounded-xl border p-4 transition-all duration-150 w-full',
        oos
          ? 'opacity-40 cursor-not-allowed border-obsidian-700/50 bg-obsidian-900/30'
          : inCart
            ? 'border-receipt-gold/40 bg-receipt-gold/5 shadow-gold'
            : 'border-[rgba(212,168,83,0.1)] bg-obsidian-900/60 hover:border-receipt-gold/30 hover:bg-obsidian-800/60',
      )}
    >
      {inCart && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-receipt-gold flex items-center justify-center">
          <CheckCircle size={12} className="text-obsidian-950" />
        </div>
      )}
      <p className="text-sm font-medium text-obsidian-200 pr-6 leading-tight">{product.name}</p>
      <p className="text-receipt-gold font-mono font-semibold mt-1.5">{formatCurrency(product.price)}</p>
      <div className="mt-2 flex items-center gap-1.5">
        {low && !oos ? (
          <span className="badge-low">{product.quantityLeft} left</span>
        ) : oos ? (
          <span className="text-xs font-mono text-obsidian-500">Out of stock</span>
        ) : (
          <span className="text-xs font-mono text-obsidian-500">{product.quantityLeft} in stock</span>
        )}
      </div>
    </button>
  )
}

function CartItem({ item, onRemove, onQtyChange }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[rgba(212,168,83,0.06)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-obsidian-200 truncate">{item.name}</p>
        <p className="text-xs font-mono text-receipt-gold">{formatCurrency(item.price)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onQtyChange(item.productId, item.quantity - 1)}
          className="w-6 h-6 rounded-md bg-obsidian-800 border border-obsidian-700 flex items-center justify-center hover:border-receipt-gold/40 transition-colors"
        >
          <Minus size={10} />
        </button>
        <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => onQtyChange(item.productId, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
          className="w-6 h-6 rounded-md bg-obsidian-800 border border-obsidian-700 flex items-center justify-center hover:border-receipt-gold/40 transition-colors disabled:opacity-30"
        >
          <Plus size={10} />
        </button>
      </div>
      <p className="font-mono text-sm text-obsidian-300 w-20 text-right shrink-0">
        {formatCurrency(item.price * item.quantity)}
      </p>
      <button
        onClick={() => onRemove(item.productId)}
        className="text-obsidian-600 hover:text-red-400 transition-colors ml-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export default function SalesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const {
    cart, total, count, addItem, removeItem, setQty,
    clearCart, setCustomer, setPayment, setStatus,
  } = useCart()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn:  () => productsApi.list().then((r) => {
      const data = r.data
      return Array.isArray(data) ? data : data?.products ?? data?.data ?? []
    }),
  })

  const filtered = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, search])

  const cartProductIds = new Set(cart.items.map((i) => i.productId))

  const { mutate: submitSale, isPending } = useMutation({
    mutationFn: () =>
      salesApi.create({
        customerName:  cart.customerName,
        paymentMethod: cart.paymentMethod,
        isPaid:        cart.status === true,
        staffId:       user?._id ?? user?.id ?? user?.staffId ?? user?.StaffId,
        items: cart.items.map((i) => ({
          product:  i.productId,
          quantity: i.quantity,
        })),
      }),
    onSuccess: (res) => {
      toast.success('Sale recorded successfully!')
      clearCart()
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['sales-eod'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleSubmit = () => {
    if (cart.items.length === 0) { toast.error('Cart is empty'); return }
    if (!cart.customerName?.trim()) { toast.error('Please enter customer name'); return }
    if (!cart.paymentMethod) { toast.error('Please select payment method'); return }
    if (cart.status === null || cart.status === undefined) { toast.error('Please select status'); return }
    submitSale()
  }


  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* ── Product panel ────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-[rgba(212,168,83,0.08)]">
          <h1 className="font-display text-2xl text-white mb-4">New Sale</h1>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="field pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Spinner size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Search} title="No products found" description="Try a different search term" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((product) => {
                const productId = product._id ?? product.id
                return (
                <ProductCard
                  key={productId}
                  product={product}
                  onAdd={addItem}
                  inCart={cartProductIds.has(productId)}
                />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Cart panel ───────────────────────────────────────── */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-[rgba(212,168,83,0.1)] bg-obsidian-900/50">
        {/* Cart header */}
        <div className="px-5 pt-5 pb-4 border-b border-[rgba(212,168,83,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-receipt-gold" />
              <span className="font-display text-lg text-white">Cart</span>
            </div>
            {count > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-obsidian-500">{count} item{count !== 1 ? 's' : ''}</span>
                <button onClick={clearCart} className="text-xs text-obsidian-600 hover:text-red-400 transition-colors">Clear</button>
              </div>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingCart size={32} className="text-obsidian-700 mb-3" />
              <p className="text-sm text-obsidian-500">No items yet</p>
              <p className="text-xs text-obsidian-600 mt-1">Tap a product to add it</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onRemove={removeItem}
                onQtyChange={setQty}
              />
            ))
          )}
        </div>

        {/* Cart footer / checkout */}
        <div className="px-5 pb-5 pt-3 border-t border-[rgba(212,168,83,0.08)] space-y-4">
          {/* Total */}
          <div className="flex items-center justify-between py-2 border-b border-[rgba(212,168,83,0.1)]">
            <span className="text-sm text-obsidian-400">Total</span>
            <span className="font-mono text-xl text-receipt-gold font-semibold">{formatCurrency(total)}</span>
          </div>

          {/* Customer */}
          <div>
            <label className="field-label">Customer Name</label>
            <input
              value={cart.customerName}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Walk-in customer"
              className="field"
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="field-label">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = PAYMENT_ICONS[method]
                return (
                  <button
                    key={method}
                    onClick={() => setPayment(method)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all duration-150',
                      cart.paymentMethod === method
                        ? 'border-receipt-gold/50 bg-receipt-gold/10 text-receipt-gold'
                        : 'border-obsidian-700 text-obsidian-500 hover:border-obsidian-600',
                    )}
                  >
                    <Icon size={15} />
                    {method}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="field-label">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: true,  icon: CheckCircle, label: 'Paid'   },
                { v: false, icon: Clock,       label: 'Unpaid' },
              ].map(({ v, icon: Icon, label }) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-medium transition-all',
                    cart.status === v
                      ? v
                        ? 'border-green-600/40 bg-green-900/20 text-green-400'
                        : 'border-amber-600/40 bg-amber-900/20 text-amber-400'
                      : 'border-obsidian-700 text-obsidian-500 hover:border-obsidian-600',
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isPending || cart.items.length === 0}
            className="btn-primary w-full justify-center py-3.5 text-base animate-pulse-gold"
          >
            {isPending ? <Spinner size={16} /> : null}
            {isPending ? 'Processing…' : `Charge ${formatCurrency(total)}`}
          </button>

        </div>
      </div>
    </div>
  )
}
