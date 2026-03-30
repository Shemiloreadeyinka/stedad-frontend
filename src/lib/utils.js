import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = '₦') {
  if (amount == null) return `${currency}0.00`
  return `${currency}${Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-NG', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

export function formatTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('en-NG', {
    hour:   '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date) {
  if (!date) return '—'
  return `${formatDate(date)}, ${formatTime(date)}`
}

export function isLowStock(qty, threshold = 5) {
  return qty <= threshold
}

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    'An unexpected error occurred'
  )
}

export const PAYMENT_METHODS = ['Cash', 'Transfer', 'POS']
export const ROLES            = ['Admin', 'Manager', 'Cashier']
export const LOW_STOCK_LIMIT  = 5
