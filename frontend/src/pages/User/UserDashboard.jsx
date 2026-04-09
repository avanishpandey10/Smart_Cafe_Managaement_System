import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fetchMenu } from '../../redux/slices/menuSlice'
import { createOrder } from '../../redux/slices/orderSlice'
import Header from '../../components/shared/Header'
import api from '../../api'

const CATEGORIES = ['All', 'Beverages', 'Snacks', 'Meals', 'Desserts', 'Specials']

export default function UserDashboard() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { items: menuItems, loading: menuLoading } = useSelector(s => s.menu)
  const { loading: orderLoading } = useSelector(s => s.orders)

  const [tables, setTables] = useState([])
  const [cart, setCart] = useState([])
  const [selectedTable, setSelectedTable] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [category, setCategory] = useState('All')
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [placing, setPlacing] = useState(false)

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
    { to: '/orders', label: t('nav.orders'), icon: '📋' },
  ]

  useEffect(() => {
    const tableNum = searchParams.get('table')
    if (tableNum) {
      setSelectedTable(tableNum)
      toast.info(`Table ${tableNum} selected from QR code`)
    }
  }, [searchParams])

  useEffect(() => {
    dispatch(fetchMenu())
    api.get('/tables').then(r => setTables(r.data)).catch(() => {})
  }, [dispatch])

  const filtered = category === 'All' ? menuItems.filter(i => i.available) : menuItems.filter(i => i.available && i.category === category)

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === item._id)
      if (existing) return prev.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { ...item, quantity: 1 }]
    })
    toast.success(`${item.name} added to cart`, { autoClose: 1500 })
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(c => c._id === id ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0))
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0)
  const discount = couponResult?.discount || 0
  const total = Math.max(0, subtotal - discount)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal })
      setCouponResult(data)
      toast.success(`${t('coupon.applied')} –₹${data.discount} off!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
      setCouponResult(null)
    } finally { setCouponLoading(false) }
  }

  const placeOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    if (!selectedTable) { toast.error('Please select a table'); return }

    const table = tables.find(t => String(t.tableNumber) === String(selectedTable))
    if (!table) { toast.error('Table not found'); return }
    if (table.status === 'occupied') { toast.error('Table is occupied'); return }

    setPlacing(true)
    try {
      await dispatch(createOrder({
        tableId: table._id,
        items: cart.map(c => ({ menuItemId: c._id, quantity: c.quantity })),
        specialInstructions,
        couponCode: couponResult ? couponCode : '',
      })).unwrap()
      toast.success('Order placed successfully!')
      setCart([])
      setCouponCode('')
      setCouponResult(null)
      setSpecialInstructions('')
    } catch (err) {
      toast.error(err)
    } finally { setPlacing(false) }
  }

  return (
    <div className="min-h-screen bg-dark-700">
      <Header navLinks={navLinks} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-cafe-900 mb-6">
          {t('nav.menu')} & {t('order.placeOrder')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === c ? 'bg-forest-500 text-white shadow-sm' : 'bg-dark-300 text-cafe-500 hover:bg-cafe-100 border border-cafe-200'}`}>
                  {c}
                </button>
              ))}
            </div>

            {menuLoading ? (
              <div className="text-center py-12 text-cafe-400">{t('common.loading')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(item => {
                  const inCart = cart.find(c => c._id === item._id)
                  return (
                    <div key={item._id} className="card hover:shadow-md hover:border-cafe-200 transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-cafe-900 group-hover:text-forest-500 transition-colors truncate">{item.name}</h3>
                          <p className="text-xs text-cafe-400 mt-0.5 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-cafe-100 text-cafe-500 px-2 py-0.5 rounded-full">{item.category}</span>
                            {item.averageRating > 0 && (
                              <span className="text-xs text-amber-400">⭐ {item.averageRating.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="font-bold text-lg text-warmOrange-600">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-dark-400 rounded-lg p-1">
                            <button onClick={() => updateQty(item._id, -1)}
                              className="w-7 h-7 flex items-center justify-center bg-dark-300 rounded-md shadow-sm text-cafe-600 hover:bg-red-900/30 hover:text-red-400 transition-colors font-bold">
                              −
                            </button>
                            <span className="w-6 text-center font-semibold text-cafe-900 text-sm">{inCart.quantity}</span>
                            <button onClick={() => updateQty(item._id, 1)}
                              className="w-7 h-7 flex items-center justify-center bg-forest-500 rounded-md shadow-sm text-white hover:bg-forest-600 transition-colors font-bold">
                              +
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item)}
                            className="btn-primary btn-sm">
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cart & Order */}
          <div className="space-y-4">
            {/* Table selection */}
            <div className="card">
              <h3 className="font-semibold text-cafe-800 mb-3">🪑 Select Table</h3>
              <select className="input" value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
                <option value="">-- Choose table --</option>
                {tables.filter(t => t.status === 'available').map(t => (
                  <option key={t._id} value={t.tableNumber}>Table {t.tableNumber} (Cap: {t.capacity})</option>
                ))}
              </select>
              {tables.find(t => String(t.tableNumber) === String(selectedTable))?.status === 'occupied' && (
                <p className="text-red-400 text-xs mt-1">⚠️ This table is occupied</p>
              )}
            </div>

            {/* Cart */}
            <div className="card">
              <h3 className="font-semibold text-cafe-800 mb-3">🛒 Cart ({cart.length})</h3>
              {cart.length === 0 ? (
                <p className="text-cafe-400 text-sm text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item._id} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="text-cafe-600 truncate block">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <button onClick={() => updateQty(item._id, -1)} className="w-5 h-5 bg-dark-400 rounded text-center leading-5 text-cafe-500 hover:bg-red-900/30 hover:text-red-400">−</button>
                        <span className="w-5 text-center font-semibold text-cafe-800">{item.quantity}</span>
                        <button onClick={() => updateQty(item._id, 1)} className="w-5 h-5 bg-dark-400 rounded text-center leading-5 text-cafe-500 hover:bg-green-900/30 hover:text-green-400">+</button>
                        <span className="text-cafe-600 font-medium w-16 text-right">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon */}
            {cart.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-cafe-800 mb-3">🏷️ {t('order.applyCoupon')}</h3>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 uppercase"
                    placeholder={t('coupon.code')}
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value); setCouponResult(null) }}
                  />
                  <button onClick={applyCoupon} disabled={couponLoading} className="btn-secondary btn-sm">
                    {couponLoading ? '...' : t('coupon.apply')}
                  </button>
                </div>
                {couponResult && (
                  <p className="text-green-400 text-sm mt-2">✅ {t('coupon.applied')} –₹{couponResult.discount}</p>
                )}
              </div>
            )}

            {/* Special instructions */}
            <div className="card">
              <h3 className="font-semibold text-cafe-800 mb-3">📝 {t('order.specialInstructions')}</h3>
              <textarea className="input resize-none" rows={2} placeholder="Allergies, preferences..."
                value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} />
            </div>

            {/* Summary */}
            {cart.length > 0 && (
              <div className="card bg-forest-500/90 text-white border-forest-600">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-80">{t('order.subtotal')}</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-200">
                      <span>{t('order.discount')}</span>
                      <span>–₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-white/20 pt-2 mt-2">
                    <span>{t('order.grandTotal')}</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                <button onClick={placeOrder} disabled={placing || orderLoading}
                  className="mt-4 w-full bg-white text-forest-600 font-semibold py-3 rounded-lg hover:bg-cafe-900 transition-colors disabled:opacity-60">
                  {placing ? t('common.loading') : `✓ ${t('order.placeOrder')}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}