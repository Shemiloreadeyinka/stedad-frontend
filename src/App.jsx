import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from '@/store/auth'
import { CartProvider } from '@/store/cart'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import LoginPage     from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import SalesPage     from '@/pages/SalesPage'
import HistoryPage   from '@/pages/HistoryPage'
import StaffPage     from '@/pages/StaffPage'
import InventoryPage from '@/pages/InventoryPage'
import NotFoundPage  from '@/pages/NotFoundPage'

// Wraps Outlet in the sidebar shell
function LayoutShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — all authenticated roles */}
          <Route element={<ProtectedRoute />}>
            <Route element={<LayoutShell />}>
              <Route index         element={<DashboardPage />} />
              <Route path="sales"    element={<SalesPage />} />
              <Route path="history"  element={<HistoryPage />} />
              <Route path="products" element={<InventoryPage />} />

              {/* Admin-only group */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="staff" element={<StaffPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*"    element={<Navigate to="/404" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
