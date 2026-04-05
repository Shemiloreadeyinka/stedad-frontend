import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className, ...props }) {
  return <div className={cn('skeleton h-4 w-full', className)} {...props} />
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, className }) {
  return <Loader2 size={size} className={cn('animate-spin text-receipt-gold', className)} />
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-obsidian-800/60 border border-[rgba(212,168,83,0.1)] flex items-center justify-center mb-4">
          <Icon size={28} className="text-obsidian-500" />
        </div>
      )}
      <p className="text-obsidian-300 font-medium mb-1">{title}</p>
      {description && <p className="text-sm text-obsidian-500 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative glass-card w-full shadow-panel animate-fade-up', maxWidth)}>
        {title && (
          <div className="px-6 py-4 border-b border-[rgba(212,168,83,0.1)] flex items-center justify-between">
            <h3 className="font-display text-lg text-white">{title}</h3>
            <button onClick={onClose} className="text-obsidian-500 hover:text-white transition-colors text-lg leading-none">✕</button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-obsidian-400 mb-6">{description}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={14} /> : null}
          Confirm
        </button>
      </div>
    </Modal>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-1">
      <div>
        <h1 className="font-display text-2xl text-white">{title}</h1>
        {subtitle && <p className="text-sm text-obsidian-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  )
}

// ── Form field wrapper ────────────────────────────────────────────────────────
export function FormField({ label, error, children }) {
  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        'field appearance-none cursor-pointer',
        className,
      )}
      {...props}
    />
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const normalized =
    status === true
      ? 'Paid'
      : status === false
        ? 'Unpaid'
        : status
  const map = {
    paid:   'badge-paid',
    unpaid: 'badge-unpaid',
    Paid:   'badge-paid',
    Unpaid: 'badge-unpaid',
  }
  return (
    <span className={map[normalized] ?? 'badge-unpaid'}>
      {normalized ?? 'Unpaid'}
    </span>
  )
}

export { MultiplePaymentModal } from './MultiplePaymentModal'
