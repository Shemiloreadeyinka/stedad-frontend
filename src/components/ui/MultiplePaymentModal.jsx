import { useState, useEffect } from 'react'
import { X, Banknote, Smartphone, CreditCard, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const PAYMENT_TYPES = [
  { id: 'Cash', label: 'Cash', icon: Banknote, color: 'text-emerald-400' },
  { id: 'Transfer', label: 'Transfer', icon: Smartphone, color: 'text-blue-400' },
  { id: 'POS', label: 'POS', icon: CreditCard, color: 'text-purple-400' },
]

export function MultiplePaymentModal({ isOpen, onClose, total, onConfirm }) {
  const [payments, setPayments] = useState({
    Cash: 0,
    Transfer: 0,
    POS: 0,
  })

  useEffect(() => {
    if (isOpen) {
      setPayments({ Cash: 0, Transfer: 0, POS: 0 })
    }
  }, [isOpen])

  const totalPaid = Object.values(payments).reduce((sum, v) => sum + v, 0)
  const remaining = total - totalPaid
  const isValid = Math.abs(remaining) < 0.01 && totalPaid > 0

  const handleChange = (method, value) => {
    const numValue = Math.max(0, Number(value) || 0)
    setPayments((prev) => ({
      ...prev,
      [method]: numValue,
    }))
  }

  const handleConfirm = () => {
    if (!isValid) return
    const paymentArray = Object.entries(payments)
      .filter(([, amount]) => amount > 0)
      .map(([method, amount]) => ({
        method,
        amount,
      }))
    onConfirm(paymentArray)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-obsidian-950 border border-[rgba(212,168,83,0.1)] rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(212,168,83,0.1)]">
          <h2 className="text-lg font-display text-white">Split Payment</h2>
          <button
            onClick={onClose}
            className="text-obsidian-500 hover:text-obsidian-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Total to pay */}
          <div className="bg-obsidian-900/50 rounded-lg p-4 border border-[rgba(212,168,83,0.1)]">
            <p className="text-xs text-obsidian-500 mb-1">Total Amount</p>
            <p className="text-2xl font-mono font-semibold text-receipt-gold">{formatCurrency(total)}</p>
          </div>

          {/* Payment inputs */}
          <div className="space-y-4">
            {PAYMENT_TYPES.map(({ id, label, icon: Icon, color }) => (
              <div key={id}>
                <label className="flex items-center gap-2 text-sm font-medium text-obsidian-300 mb-2">
                  <Icon size={16} className={color} />
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-obsidian-500">N</span>
                  <input
                    type="number"
                    value={payments[id] || ''}
                    onChange={(e) => handleChange(id, e.target.value)}
                    placeholder="0.00"
                    className="field flex-1"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-obsidian-900/50 rounded-lg p-4 border border-[rgba(212,168,83,0.1)] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-obsidian-400">Total Entered:</span>
              <span className={cn(
                'font-mono font-semibold',
                totalPaid > total ? 'text-red-400' : totalPaid === total ? 'text-green-400' : 'text-obsidian-400',
              )}>
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-obsidian-400">Remaining:</span>
              <span className={cn(
                'font-mono font-semibold',
                remaining > 0.01 ? 'text-amber-400' : remaining < -0.01 ? 'text-red-400' : 'text-green-400',
              )}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          {/* Error message */}
          {totalPaid > 0 && !isValid && (
            <div className="flex items-gap gap-2 p-3 bg-amber-900/20 border border-amber-600/30 rounded-lg">
              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                {remaining > 0.01
                  ? `Still need N${remaining.toFixed(2)}`
                  : `Overpaid by N${Math.abs(remaining).toFixed(2)}`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(212,168,83,0.1)] flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Split
          </button>
        </div>
      </div>
    </div>
  )
}
