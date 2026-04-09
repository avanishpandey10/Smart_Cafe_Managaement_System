import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fetchOrders, updateOrderStatus } from '../../redux/slices/orderSlice'

const STATUS_BADGE = {
  pending:'badge-pending',approved:'badge-approved',preparing:'badge-preparing',
  ready:'badge-ready',completed:'badge-completed',cancelled:'badge-cancelled'
}
const NEXT = { pending:'approved', approved:'preparing', preparing:'ready', ready:'completed' }
const NEXT_LABEL = { pending:'✓ Approve', approved:'▶ Preparing', preparing:'✓ Ready', ready:'✓ Complete' }

export default function AdminOrders() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { orders, loading } = useSelector(s => s.orders)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => { dispatch(fetchOrders()) }, [dispatch])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const handleUpdate = async (order, status) => {
    setUpdating(order._id)
    try {
      await dispatch(updateOrderStatus({ id: order._id, status })).unwrap()
      toast.success(`Order ${status}`)
    } catch (err) { toast.error(err) }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-cafe-900">{t('nav.orders')}</h2>
        <button onClick={() => dispatch(fetchOrders())} className="btn-secondary btn-sm">↻ Refresh</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all','pending','approved','preparing','ready','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter===s?'bg-forest-500 text-white':'bg-dark-300 text-cafe-500 hover:bg-cafe-100 border border-cafe-200'}`}>
            {s} {s==='all' ? `(${orders.length})` : `(${orders.filter(o=>o.status===s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-cafe-400">{t('common.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-cafe-400">{t('common.noData')}</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-dark-400 border-b border-cafe-100">
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Table</th><th>Items</th>
                  <th>Total</th><th>Payment</th><th>Status</th><th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order._id}>
                    <td className="font-mono text-xs text-cafe-500">#{order._id.slice(-6).toUpperCase()}</td>
                    <td>
                      <p className="font-medium text-cafe-800 text-sm">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-cafe-400">{order.user?.email}</p>
                    </td>
                    <td className="font-semibold text-cafe-700">Table {order.table?.tableNumber}</td>
                    <td>
                      <div className="text-xs text-cafe-500 max-w-[200px]">
                        {order.items.map((i,idx) => <span key={idx} className="inline-block bg-dark-400 px-1.5 py-0.5 rounded mr-1 mb-1">{i.name}×{i.quantity}</span>)}
                      </div>
                    </td>
                    <td className="font-bold text-cafe-900">₹{order.totalAmount}</td>
                    <td>
                      <span className={order.paymentStatus==='paid'?'badge-paid':'badge-unpaid'}>{order.paymentStatus}</span>
                    </td>
                    <td><span className={STATUS_BADGE[order.status]}>{order.status}</span></td>
                    <td>
                      <div className="flex gap-1">
                        {NEXT[order.status] && (
                          <button onClick={() => handleUpdate(order, NEXT[order.status])}
                            disabled={updating===order._id}
                            className="btn-primary btn-sm text-xs">
                            {updating===order._id ? '...' : NEXT_LABEL[order.status]}
                          </button>
                        )}
                        {['pending','approved'].includes(order.status) && (
                          <button onClick={() => handleUpdate(order, 'cancelled')}
                            disabled={updating===order._id}
                            className="btn-danger btn-sm text-xs">
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}