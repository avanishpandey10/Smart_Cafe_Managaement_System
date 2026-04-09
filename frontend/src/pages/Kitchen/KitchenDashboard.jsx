import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fetchOrders, updateOrderStatus } from '../../redux/slices/orderSlice'
import Header from '../../components/shared/Header'
import KitchenTimer from '../../components/Kitchen/KitchenTimer'

const KITCHEN_STATUSES = ['approved', 'preparing', 'ready']
const NEXT_STATUS = { approved: 'preparing', preparing: 'ready', ready: 'completed' }
const NEXT_LABEL = { approved: '▶ Start Preparing', preparing: '✓ Mark Ready', ready: '✓ Complete' }

const STATUS_COLOR = {
  approved:  'border-blue-500/40 bg-blue-900/20',
  preparing: 'border-orange-500/40 bg-orange-900/20',
  ready:     'border-purple-500/40 bg-purple-900/20',
}

export default function KitchenDashboard() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { orders, loading } = useSelector(s => s.orders)
  const [updating, setUpdating] = useState(null)

  const navLinks = [
    { to: '/kitchen', label: t('nav.kitchen'), icon: '👨‍🍳' },
    { to: '/orders', label: t('nav.orders'), icon: '📋' },
  ]

  useEffect(() => {
    dispatch(fetchOrders())
    const interval = setInterval(() => dispatch(fetchOrders()), 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  const kitchenOrders = orders.filter(o => KITCHEN_STATUSES.includes(o.status))

  const byStatus = {
    approved: kitchenOrders.filter(o => o.status === 'approved'),
    preparing: kitchenOrders.filter(o => o.status === 'preparing'),
    ready: kitchenOrders.filter(o => o.status === 'ready'),
  }

  const handleStatusUpdate = async (order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setUpdating(order._id)
    try {
      await dispatch(updateOrderStatus({ id: order._id, status: next })).unwrap()
      toast.success(`Order #${order._id.slice(-6).toUpperCase()} → ${next}`)
    } catch (err) {
      toast.error(err)
    } finally { setUpdating(null) }
  }

  const OrderCard = ({ order }) => (
    <div className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${STATUS_COLOR[order.status]}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono font-bold text-cafe-800">#{order._id.slice(-6).toUpperCase()}</p>
          <p className="text-sm text-cafe-500 mt-0.5">
            🪑 Table {order.table?.tableNumber}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {order.approvedAt && <KitchenTimer approvedAt={order.approvedAt} />}
          <span className="text-xs text-cafe-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-cafe-700 font-medium">{item.name}</span>
            <span className="bg-dark-400 px-2 py-0.5 rounded-full text-cafe-500 font-mono text-xs border border-cafe-200">
              ×{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-amber-400 font-medium">⚠️ Note: {order.specialInstructions}</p>
        </div>
      )}

      <button
        onClick={() => handleStatusUpdate(order)}
        disabled={updating === order._id}
        className="w-full btn-primary btn-sm"
      >
        {updating === order._id ? '...' : NEXT_LABEL[order.status]}
      </button>
    </div>
  )

  const ColumnHeader = ({ status, count, color }) => (
    <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${color}`}>
      <h2 className="font-display font-bold text-lg text-cafe-900 capitalize">{status}</h2>
      <span className="bg-cafe-100 text-cafe-800 text-xs font-mono px-2.5 py-1 rounded-full">{count}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-700">
      <Header navLinks={navLinks} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-cafe-900">Kitchen Display</h1>
          <div className="flex items-center gap-2 text-sm text-cafe-500">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live · {kitchenOrders.length} active
          </div>
        </div>

        {loading && kitchenOrders.length === 0 ? (
          <div className="text-center py-16 text-cafe-400">{t('common.loading')}</div>
        ) : kitchenOrders.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-3">🍽️</p>
            <p className="font-display text-xl text-cafe-600">No active orders</p>
            <p className="text-cafe-400 text-sm mt-1">Waiting for orders to be approved...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <ColumnHeader status="Approved" count={byStatus.approved.length} color="border-blue-500" />
              <div className="space-y-3">
                {byStatus.approved.length === 0 ? (
                  <p className="text-center text-cafe-400 text-sm py-6">No approved orders</p>
                ) : byStatus.approved.map(o => <OrderCard key={o._id} order={o} />)}
              </div>
            </div>

            <div>
              <ColumnHeader status="Preparing" count={byStatus.preparing.length} color="border-orange-500" />
              <div className="space-y-3">
                {byStatus.preparing.length === 0 ? (
                  <p className="text-center text-cafe-400 text-sm py-6">Nothing being prepared</p>
                ) : byStatus.preparing.map(o => <OrderCard key={o._id} order={o} />)}
              </div>
            </div>

            <div>
              <ColumnHeader status="Ready" count={byStatus.ready.length} color="border-purple-500" />
              <div className="space-y-3">
                {byStatus.ready.length === 0 ? (
                  <p className="text-center text-cafe-400 text-sm py-6">Nothing ready yet</p>
                ) : byStatus.ready.map(o => <OrderCard key={o._id} order={o} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}