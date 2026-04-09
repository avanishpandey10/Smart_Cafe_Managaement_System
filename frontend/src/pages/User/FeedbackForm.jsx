import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import api from '../../api'
import Header from '../../components/shared/Header'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className={`text-3xl transition-all ${(hovered || value) >= star ? 'text-amber-400 scale-110' : 'text-cafe-300'}`}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function FeedbackForm() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [order, setOrder] = useState(null)
  const [orderRating, setOrderRating] = useState(0)
  const [orderComment, setOrderComment] = useState('')
  const [itemRatings, setItemRatings] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
    { to: '/orders', label: t('nav.orders'), icon: '📋' },
  ]

  useEffect(() => {
    api.get(`/orders/${orderId}`).then(r => {
      setOrder(r.data)
      const init = {}
      r.data.items.forEach(item => { init[item.menuItem?._id || item.menuItem] = { rating: 0, comment: '' } })
      setItemRatings(init)
    }).catch(() => toast.error('Order not found'))
  }, [orderId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (orderRating === 0) { toast.error('Please rate your order'); return }
    setSubmitting(true)
    try {
      await api.post('/feedback', { orderId, rating: orderRating, comment: orderComment, type: 'order' })
      for (const [menuItemId, data] of Object.entries(itemRatings)) {
        if (data.rating > 0) {
          await api.post('/feedback', { menuItemId, rating: data.rating, comment: data.comment, type: 'item' })
        }
      }
      setSubmitted(true)
      toast.success('Thank you for your feedback!')
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit')
    } finally { setSubmitting(false) }
  }

  if (!order) return (
    <div className="min-h-screen bg-dark-700">
      <Header navLinks={navLinks} />
      <div className="flex items-center justify-center h-64 text-cafe-400">{t('common.loading')}</div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-dark-700">
      <Header navLinks={navLinks} />
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-2xl font-bold text-cafe-900">Thank you!</h2>
          <p className="text-cafe-500 mt-2">Your feedback helps us improve.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-700">
      <Header navLinks={navLinks} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card">
          <h1 className="font-display text-2xl font-bold text-cafe-900 mb-1">{t('feedback.rateOrder')}</h1>
          <p className="text-cafe-500 text-sm mb-6">
            Order #{orderId.slice(-6).toUpperCase()} · Table {order.table?.tableNumber}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-dark-400 rounded-xl border border-cafe-100">
              <h3 className="font-semibold text-cafe-800 mb-3">Overall Experience</h3>
              <StarRating value={orderRating} onChange={setOrderRating} />
              <textarea className="input mt-3 resize-none" rows={3}
                placeholder={t('feedback.comment')}
                value={orderComment}
                onChange={e => setOrderComment(e.target.value)} />
            </div>

            <div>
              <h3 className="font-semibold text-cafe-800 mb-3">{t('feedback.rateItem')}</h3>
              <div className="space-y-3">
                {order.items.map(item => {
                  const menuId = item.menuItem?._id || item.menuItem
                  return (
                    <div key={menuId} className="p-4 bg-dark-400 rounded-xl border border-cafe-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-cafe-800">{item.name} × {item.quantity}</span>
                        <span className="text-cafe-500 text-sm">₹{item.price * item.quantity}</span>
                      </div>
                      <StarRating
                        value={itemRatings[menuId]?.rating || 0}
                        onChange={r => setItemRatings(prev => ({ ...prev, [menuId]: { ...prev[menuId], rating: r } }))}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? t('common.loading') : t('feedback.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}