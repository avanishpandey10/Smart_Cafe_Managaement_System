import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { logout } from '../../redux/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../../components/Common/LanguageSwitcher'
import { markAllRead } from '../../redux/slices/notificationSlice'

import Analytics from './Analytics'
import Inventory from './Inventory'
import FeedbackAdmin from './Feedback'
import Reservations from './Reservations'
import Coupons from './Coupons'
import Staff from './Staff'
import Exports from './Exports'
import AdminOrders from './AdminOrders'
import AdminMenu from './AdminMenu'
import AdminTables from './AdminTables'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/orders', label: 'Orders', icon: '📋' },
  { to: '/admin/menu', label: 'Menu', icon: '🍽️' },
  { to: '/admin/tables', label: 'Tables', icon: '🪑' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { to: '/admin/reservations', label: 'Reservations', icon: '📅' },
  { to: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
  { to: '/admin/staff', label: 'Staff', icon: '👥' },
  { to: '/admin/feedback', label: 'Feedback', icon: '⭐' },
  { to: '/admin/exports', label: 'Exports', icon: '💾' },
]

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { user } = useSelector(s => s.auth)
  const { unreadCount, items: notifications } = useSelector(s => s.notifications)

  const handleLogout = () => { dispatch(logout()); navigate('/login') }

  const isActive = (to, end) => end ? location.pathname === to : location.pathname.startsWith(to) && location.pathname !== '/admin'

  return (
    <div className="flex min-h-screen bg-dark-700">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-500 border-r border-cafe-100 flex flex-col sticky top-0 h-screen overflow-y-auto flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-cafe-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-500 rounded-xl flex items-center justify-center text-xl">☕</div>
            <div>
              <p className="font-display font-bold text-cafe-900">Smart Café</p>
              <p className="text-xs text-cafe-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link ${
                (link.end ? location.pathname === link.to : location.pathname.startsWith(link.to) && link.to !== '/admin') ||
                (link.end && location.pathname === '/admin')
                  ? 'active' : ''
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-cafe-100 space-y-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 bg-forest-500/20 rounded-full flex items-center justify-center text-forest-400 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cafe-800 truncate">{user?.name}</p>
              <p className="text-xs text-cafe-400">Admin</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-red-400 hover:text-red-300 transition-colors p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-dark-500 border-b border-cafe-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-display text-lg font-bold text-cafe-900">
            {NAV.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => dispatch(markAllRead())}
              className="relative p-2 rounded-lg hover:bg-cafe-100 transition-colors"
            >
              <svg className="w-5 h-5 text-cafe-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-warmOrange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-mono">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <span className="text-sm text-cafe-400">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="p-6">
          <Routes>
            <Route index element={<Analytics />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="tables" element={<AdminTables />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="staff" element={<Staff />} />
            <Route path="feedback" element={<FeedbackAdmin />} />
            <Route path="exports" element={<Exports />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}