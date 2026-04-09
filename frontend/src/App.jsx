import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import socket from './socket'
import { upsertOrder } from './redux/slices/orderSlice'
import { addNotification } from './redux/slices/notificationSlice'

import CustomCursor from './components/Common/CustomCursor'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/Admin/AdminDashboard'
import UserDashboard from './pages/User/UserDashboard'
import KitchenDashboard from './pages/Kitchen/KitchenDashboard'
import Orders from './pages/Orders'
import QRTableOrder from './pages/User/QRTableOrder'
import FeedbackForm from './pages/User/FeedbackForm'

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector(s => s.auth)
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user } = useSelector(s => s.auth)
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'kitchen') return <Navigate to="/kitchen" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)

  useEffect(() => {
    if (!user) { socket.disconnect(); return }

    socket.connect()
    socket.emit('join_room', user.role)
    socket.emit('join_room', `user_${user._id}`)

    socket.on('new_order', (order) => {
      dispatch(upsertOrder(order))
      if (user.role === 'admin' || user.role === 'kitchen') {
        dispatch(addNotification({ type: 'new_order', message: `New order from Table ${order.table?.tableNumber}`, orderId: order._id }))
        toast.info(`🛎️ New order from Table ${order.table?.tableNumber}!`)
      }
    })

    socket.on('order_updated', (order) => {
      dispatch(upsertOrder(order))
    })

    socket.on('order_status_changed', ({ status, order }) => {
      dispatch(upsertOrder(order))
      dispatch(addNotification({ type: 'status_change', message: `Your order is now ${status}`, orderId: order._id }))
      const msgs = {
        approved: '✅ Your order has been approved!',
        preparing: '👨‍🍳 Your order is being prepared!',
        ready: '🔔 Your order is ready!',
        completed: '🎉 Order completed. Thank you!',
        cancelled: '❌ Your order was cancelled.',
      }
      if (msgs[status]) toast(msgs[status], { type: status === 'cancelled' ? 'error' : 'success' })
    })

    socket.on('payment_completed', ({ orderId }) => {
      toast.success('💳 Payment confirmed!')
    })

    socket.on('low_stock_alert', ({ item, stock, minimum }) => {
      if (user.role === 'admin') {
        dispatch(addNotification({ type: 'low_stock', message: `Low stock: ${item} (${stock} remaining)` }))
        toast.warning(`⚠️ Low stock: ${item} only ${stock} left!`)
      }
    })

    return () => {
      socket.off('new_order')
      socket.off('order_updated')
      socket.off('order_status_changed')
      socket.off('payment_completed')
      socket.off('low_stock_alert')
      socket.disconnect()
    }
  }, [user, dispatch])

  return (
    <BrowserRouter>
      <CustomCursor />
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop theme="dark" />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order-table" element={<QRTableOrder />} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/feedback/:orderId" element={
          <ProtectedRoute allowedRoles={['user']}>
            <FeedbackForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/kitchen" element={
          <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
            <KitchenDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}