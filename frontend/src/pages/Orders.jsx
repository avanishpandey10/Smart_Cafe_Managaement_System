import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import { fetchOrders, cancelOrder } from '../redux/slices/orderSlice'
import Header from '../components/shared/Header'
import api from '../api'

const STATUS_BADGE = {
  pending: 'badge-pending', approved: 'badge-approved', preparing: 'badge-preparing',
  ready: 'badge-ready', completed: 'badge-completed', cancelled: 'badge-cancelled',
}

export default function Orders() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { user } = useSelector(s => s.auth)
  const { orders, loading } = useSelector(s => s.orders)
  const [filterStatus, setFilterStatus] = useState('all')
  const [cancelling, setCancelling] = useState(null)
  const [paying, setPaying] = useState(null)

  useEffect(() => { dispatch(fetchOrders()) }, [dispatch])

  const navLinks = user?.role === 'user'
    ? [{ to: '/dashboard', label: t('nav.dashboard'), icon: '🏠' }, { to: '/orders', label: t('nav.orders'), icon: '📋' }]
    : user?.role === 'admin'
    ? [{ to: '/admin', label: t('nav.dashboard'), icon: '🏠' }, { to: '/orders', label: t('nav.orders'), icon: '📋' }]
    : [{ to: '/kitchen', label: t('nav.kitchen'), icon: '👨‍🍳' }, { to: '/orders', label: t('nav.orders'), icon: '📋' }]

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  const handleCancel = async (id) => {
    if (!window.confirm(t('order.cancelConfirm'))) return
    setCancelling(id)
    try {
      await dispatch(cancelOrder(id)).unwrap()
      toast.success('Order cancelled successfully')
    } catch (err) {
      toast.error(err)
    } finally { setCancelling(null) }
  }

  const handleSimulatePayment = async (order) => {
    setPaying(order._id)
    try {
      await api.post(`/payment/simulate/${order._id}`)
      toast.success('Payment successful!')
      dispatch(fetchOrders())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally { setPaying(null) }
  }

  const downloadInvoice = (order) => {
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()

    doc.setFillColor(45, 106, 79)
    doc.rect(0, 0, pageW, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Smart Café', pageW / 2, 18, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Tax Invoice / Bill', pageW / 2, 30, { align: 'center' })

    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    let y = 55
    doc.setFont('helvetica', 'bold')
    doc.text(`Order ID: #${order._id.toString().slice(-6).toUpperCase()}`, 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, y + 8)
    doc.text(`Table: ${order.table?.tableNumber || 'N/A'}`, 14, y + 16)
    doc.text(`Customer: ${order.user?.name || 'N/A'}`, 14, y + 24)
    doc.text(`Status: ${order.status.toUpperCase()}`, 14, y + 32)
    doc.text(`Payment: ${order.paymentStatus.toUpperCase()}`, 14, y + 40)

    y = 110
    doc.setFillColor(249, 245, 240)
    doc.rect(14, y - 6, pageW - 28, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Item', 16, y)
    doc.text('Qty', 120, y, { align: 'right' })
    doc.text('Price', 150, y, { align: 'right' })
    doc.text('Total', pageW - 16, y, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    y += 10
    order.items.forEach((item) => {
      doc.text(item.name, 16, y)
      doc.text(String(item.quantity), 120, y, { align: 'right' })
      doc.text(`Rs.${item.price}`, 150, y, { align: 'right' })
      doc.text(`Rs.${item.price * item.quantity}`, pageW - 16, y, { align: 'right' })
      y += 9
    })

    y += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(14, y, pageW - 14, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal:', 120, y)
    doc.text(`Rs.${order.subtotal}`, pageW - 16, y, { align: 'right' })
    if (order.discount > 0) {
      y += 8
      doc.setTextColor(34, 197, 94)
      doc.text(`Discount (${order.couponCode}):`, 120, y)
      doc.text(`-Rs.${order.discount}`, pageW - 16, y, { align: 'right' })
      doc.setTextColor(50, 50, 50)
    }
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOTAL:', 120, y)
    doc.text(`Rs.${order.totalAmount}`, pageW - 16, y, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text('Thank you for visiting Smart Café!', pageW / 2, 270, { align: 'center' })
    doc.text('This is a computer-generated invoice.', pageW / 2, 277, { align: 'center' })

    doc.save(`invoice-${order._id.toString().slice(-6).toUpperCase()}.pdf`)
    toast.success('Invoice downloaded!')
  }

  return (
    <div className="min-h-screen bg-dark-700">
      <Header navLinks={navLinks} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-cafe-900">{t('order.myOrders')}</h1>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'preparing', 'ready', 'completed', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filterStatus === s ? 'bg-forest-500 text-white' : 'bg-dark-300 text-cafe-500 hover:bg-cafe-100 border border-cafe-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-cafe-400">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-cafe-500">{t('common.noData')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order._id} className="card hover:shadow-md hover:border-cafe-200 transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-cafe-500">
                        #{order._id.toString().slice(-6).toUpperCase()}
                      </span>
                      <span className={STATUS_BADGE[order.status]}>{order.status}</span>
                      <span className={order.paymentStatus === 'paid' ? 'badge-paid' : 'badge-unpaid'}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-cafe-500">
                      Table {order.table?.tableNumber} · {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.couponCode && (
                      <p className="text-xs text-green-400 mt-1">🏷️ Coupon: {order.couponCode} (saved ₹{order.discount})</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-cafe-900">₹{order.totalAmount}</p>
                    {order.discount > 0 && (
                      <p className="text-xs text-cafe-400 line-through">₹{order.subtotal}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-cafe-100">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, i) => (
                      <span key={i} className="bg-dark-400 text-cafe-600 text-xs px-2 py-1 rounded-lg border border-cafe-100">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  {order.specialInstructions && (
                    <p className="text-xs text-cafe-400 mt-2 italic">"{order.specialInstructions}"</p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {['pending', 'approved'].includes(order.status) && user?.role === 'user' && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      disabled={cancelling === order._id}
                      className="btn-danger btn-sm"
                    >
                      {cancelling === order._id ? '...' : t('order.cancelOrder')}
                    </button>
                  )}

                  {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && user?.role === 'user' && (
                    <button
                      onClick={() => handleSimulatePayment(order)}
                      disabled={paying === order._id}
                      className="btn-primary btn-sm"
                    >
                      {paying === order._id ? '...' : t('order.payNow')}
                    </button>
                  )}

                  {order.status !== 'cancelled' && (
                    <button onClick={() => downloadInvoice(order)} className="btn-secondary btn-sm">
                      📄 {t('order.downloadInvoice')}
                    </button>
                  )}

                  {order.status === 'completed' && user?.role === 'user' && (
                    <Link to={`/feedback/${order._id}`} className="btn-secondary btn-sm">
                      ⭐ {t('order.leaveFeedback')}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}