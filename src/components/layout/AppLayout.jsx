import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Receipt, Users,
  Package, LogOut, Menu, X, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/store/auth'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/sales',    icon: ShoppingCart,    label: 'New Sale'              },
  { to: '/history',  icon: Receipt,         label: 'Sales History'         },
  { to: '/products', icon: Package,         label: 'Inventory'             },
  { to: '/staff',    icon: Users,           label: 'Staff',  adminOnly: true },
]

function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
        isActive
          ? 'bg-receipt-gold/10 text-receipt-gold border border-receipt-gold/20'
          : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-800/60 border border-transparent',
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="font-medium">{label}</span>
      <ChevronRight
        size={12}
        className="ml-auto opacity-0 group-[.active]:opacity-60 transition-opacity"
      />
    </NavLink>
  )
}

export function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.adminOnly) return true
    const role = String(user?.role ?? '').toLowerCase()
    return role === 'admin'
  })

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col h-full bg-obsidian-900/80 backdrop-blur-md border-r border-[rgba(212,168,83,0.1)]',
      mobile ? 'w-64' : 'w-56',
    )}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-[rgba(212,168,83,0.1)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-receipt-gold/10 border border-receipt-gold/30 flex items-center justify-center">
            <Receipt size={16} className="text-receipt-gold" />
          </div>
          <div>
            <p className="font-display text-white text-base leading-none">Stedad</p>
            <p className="font-mono text-obsidian-500 text-[10px] tracking-wider mt-0.5">RECEIPTIFY</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-mono text-obsidian-600 uppercase tracking-widest">Navigation</p>
        {visibleItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 pb-4 border-t border-[rgba(212,168,83,0.1)] pt-3">
        <div className="glass-card p-3 mb-2">
          <p className="text-xs font-semibold text-obsidian-200 truncate">{user?.fullName ?? user?.name ?? 'Staff'}</p>
          <p className="text-[10px] font-mono text-obsidian-500 mt-0.5 truncate">{user?.staffId}</p>
          <span className="badge-admin mt-1.5">{user?.role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-obsidian-500
                     hover:text-red-400 hover:bg-red-900/10 transition-all duration-150"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-obsidian-950 bg-grid-subtle [background-size:32px_32px]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative animate-slide-in">
            <Sidebar mobile />
          </div>
          <button
            className="absolute top-4 right-4 text-obsidian-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[rgba(212,168,83,0.1)] bg-obsidian-900/60 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-obsidian-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-receipt-gold" />
            <span className="font-display text-white text-sm">Stedad</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
