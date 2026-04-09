import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { logout } from '../../redux/slices/authSlice'
import { markAllRead } from '../../redux/slices/notificationSlice'
import LanguageSwitcher from '../Common/LanguageSwitcher'

export default function Header({ navLinks = [] }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { user } = useSelector(s => s.auth)
  const { items: notifications, unreadCount } = useSelector(s => s.notifications)
  const [showNotifs, setShowNotifs] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const roleBadge = {
    admin: 'bg-purple-900/40 text-purple-400',
    kitchen: 'bg-orange-900/40 text-orange-400',
    user: 'bg-blue-900/40 text-blue-400',
  }

  return (
    <header className="bg-dark-500 border-b border-cafe-100 sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="font-display font-bold text-xl text-cafe-900">Smart Café</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to || location.pathname.startsWith(link.to + '/')
                    ? 'bg-forest-500 text-white'
                    : 'text-cafe-500 hover:bg-cafe-100 hover:text-cafe-800'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifs(!showNotifs); if (unreadCount > 0) dispatch(markAllRead()) }}
                className="relative p-2 rounded-lg hover:bg-cafe-100 transition-colors"
              >
                <svg className="w-5 h-5 text-cafe-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-warmOrange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-mono">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-dark-300 rounded-xl shadow-xl border border-cafe-100 z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-cafe-100">
                    <h3 className="font-semibold text-cafe-800 text-sm">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-center text-cafe-400 text-sm py-6">No notifications</p>
                  ) : (
                    notifications.slice(0, 20).map(n => (
                      <div key={n.id} className={`p-3 border-b border-cafe-100 text-sm ${!n.read ? 'bg-blue-900/20' : ''}`}>
                        <p className="text-cafe-600">{n.message}</p>
                        <p className="text-cafe-400 text-xs mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-cafe-800">{user.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role]}`}>{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary btn-sm text-red-400 hover:bg-red-900/30">
                  {t('nav.logout')}
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5 text-cafe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden pb-3 pt-1 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.to ? 'bg-forest-500 text-white' : 'text-cafe-500 hover:bg-cafe-100'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}