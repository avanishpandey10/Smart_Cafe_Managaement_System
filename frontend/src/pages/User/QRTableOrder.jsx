import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function QRTableOrder() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const tableNum = searchParams.get('table')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        sessionStorage.setItem('qr_table', tableNum || '')
        navigate(`/login?redirect=/order-table?table=${tableNum}`)
      } else {
        navigate(`/dashboard?table=${tableNum}`)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [user, tableNum, navigate])

  return (
    <div className="min-h-screen bg-dark-700 flex items-center justify-center">
      <div className="text-center card max-w-sm mx-4 shadow-xl border-cafe-200">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="font-display text-2xl font-bold text-cafe-900 mb-2">Smart Café</h1>
        <p className="text-cafe-500 mb-4">
          {tableNum ? `Welcome to Table ${tableNum}!` : 'Welcome!'}
        </p>
        <div className="flex items-center justify-center gap-2 text-forest-500">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">Loading your order page...</span>
        </div>
      </div>
    </div>
  )
}