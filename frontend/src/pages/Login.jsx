import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { login, clearError } from '../redux/slices/authSlice'
import LanguageSwitcher from '../components/Common/LanguageSwitcher'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { loading, error, user } = useSelector(s => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (user) navigate('/')
    return () => dispatch(clearError())
  }, [user, navigate, dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(form))
  }

  return (
    <div className="min-h-screen bg-dark-700 flex items-center justify-center p-4">
      {/* Subtle radial glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warmOrange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-forest-500 rounded-2xl shadow-lg shadow-forest-500/20 mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-cafe-900">Smart Café</h1>
          <p className="text-cafe-500 mt-1 font-body">Management System</p>
        </div>

        <div className="card shadow-xl border-cafe-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-cafe-800">{t('nav.login')}</h2>
            <LanguageSwitcher />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('common.email')}</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? t('common.loading') : t('nav.login')}
            </button>
          </form>

          <p className="text-center text-sm text-cafe-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-forest-500 hover:underline font-medium">Register</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-dark-400 rounded-lg border border-cafe-200">
            <p className="text-xs font-semibold text-cafe-500 mb-2 uppercase tracking-wide">Demo Accounts</p>
            <div className="space-y-1 text-xs text-cafe-400 font-mono">
              <p>Admin: admin@cafe.com / admin123</p>
              <p>Kitchen: kitchen@cafe.com / kitchen123</p>
              <p>User: user@cafe.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}