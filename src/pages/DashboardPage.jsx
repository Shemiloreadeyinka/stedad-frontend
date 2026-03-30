import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Users, ShoppingCart, Package,
  Plus, ArrowRight, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { salesApi, staffApi, productsApi } from '@/lib/api'
import { formatCurrency, formatTime } from '@/lib/utils'
import { SkeletonCard, Spinner } from '@/components/ui'
import { useAuth } from '@/store/auth'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-xs shadow-card">
      <p className="text-obsidian-400 mb-1">{label}</p>
      <p className="text-receipt-gold font-mono font-semibold">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, sub, loading, accent }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-2xl font-display text-white">{value}</p>
          {sub && <p className="text-xs text-obsidian-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ?? 'bg-receipt-gold/10'}`}>
          <Icon size={18} className="text-receipt-gold" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const today = (() => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const { data: eod, isLoading: eodLoading } = useQuery({
    queryKey: ['sales-eod', today],
    queryFn:  () => salesApi.eod({ date: today }).then((r) => r.data),
    refetchInterval: 60_000,
  })

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn:  () => staffApi.list().then((r) => {
      const data = r.data
      return Array.isArray(data) ? data : data?.staff ?? data?.data ?? []
    }),
    enabled:  String(user?.role ?? '').toLowerCase() === 'admin',
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn:  () => productsApi.list().then((r) => {
      const data = r.data
      return Array.isArray(data) ? data : data?.products ?? data?.data ?? []
    }),
  })

  const activeStaff  = staff?.filter((s) => s.status === 'Active' || s.isActive)?.length ?? 0
  const lowStockItems = products?.filter((p) => p.quantityLeft <= 5) ?? []

  // Build hourly chart data from sales
  const chartData = eod?.hourlySales ?? eod?.sales?.reduce((acc, sale) => {
    const hour = new Date(sale.createdAt).getHours()
    const label = `${hour}:00`
    const found = acc.find((a) => a.time === label)
    if (found) found.amount += sale.totalAmount
    else acc.push({ time: label, amount: sale.totalAmount })
    return acc
  }, []) ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">
          {greeting}, <span className="text-receipt-gold">{user?.fullName?.split(' ')[0] ?? 'there'}</span>
        </h1>
        <p className="text-sm text-obsidian-500 mt-1 font-mono">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Today's Revenue"
          value={eodLoading ? '...' : formatCurrency(eod?.grossSales ?? eod?.totalRevenue ?? eod?.totalAmount ?? 0)}
          icon={TrendingUp}
          sub={`${eod?.count ?? eod?.transactionCount ?? eod?.sales?.length ?? 0} transactions`}
          loading={eodLoading}
        />
        <StatCard
          label="Transactions"
          value={eod?.count ?? eod?.transactionCount ?? eod?.sales?.length ?? 0}
          icon={ShoppingCart}
          sub="today"
          loading={eodLoading}
        />
        {String(user?.role ?? '').toLowerCase() === 'admin' && (
          <StatCard
            label="Active Staff"
            value={staffLoading ? '...' : activeStaff}
            icon={Users}
            sub="currently active"
            loading={staffLoading}
          />
        )}
        <StatCard
          label="Low Stock"
          value={productsLoading ? '...' : lowStockItems.length}
          icon={AlertTriangle}
          sub="items need restocking"
          loading={productsLoading}
          accent="bg-orange-900/20"
        />
      </div>

      {/* Chart + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest">Sales Today</p>
              <p className="font-display text-xl text-white mt-0.5">Revenue Timeline</p>
            </div>
            <TrendingUp size={18} className="text-receipt-gold" />
          </div>
          {eodLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Spinner size={24} />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-obsidian-500">No sales data yet today</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ left: -10, right: 4 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D4A853" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D4A853" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,83,0.06)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#4a4840', fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fontSize: 10, fill: '#4a4840', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#D4A853" strokeWidth={2} fill="url(#goldGradient)" dot={false} activeDot={{ r: 4, fill: '#D4A853', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="glass-card p-5 flex flex-col">
          <p className="text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-4">Quick Actions</p>
          <div className="space-y-3 flex-1">
            <button
              onClick={() => navigate('/sales')}
              className="w-full btn-primary justify-center py-3"
            >
              <Plus size={16} />
              New Sale
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full btn-ghost justify-center py-3"
            >
              <Package size={16} />
              Add Product
            </button>
            <button
              onClick={() => navigate('/history')}
              className="w-full btn-ghost justify-center py-3"
            >
              <ArrowRight size={16} />
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Low stock alerts */}
      {!productsLoading && lowStockItems.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-orange-400" />
            <p className="text-sm font-medium text-orange-400">Low Stock Alerts</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {lowStockItems.slice(0, 8).map((p) => (
              <div key={p._id} className="bg-obsidian-800/60 rounded-lg px-3 py-2.5">
                <p className="text-sm text-obsidian-200 truncate">{p.name}</p>
                <p className="text-xs font-mono text-orange-400 mt-0.5">{p.quantityLeft} left</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
