import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    addNotification(state, action) {
      state.items.unshift({
        id: Date.now(),
        ...action.payload,
        read: false,
        timestamp: new Date().toISOString(),
      })
      state.unreadCount += 1
    },
    markAllRead(state) {
      state.items.forEach(n => { n.read = true })
      state.unreadCount = 0
    },
    markRead(state, action) {
      const n = state.items.find(i => i.id === action.payload)
      if (n && !n.read) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1) }
    },
    clearNotifications(state) {
      state.items = []
      state.unreadCount = 0
    },
  },
})

export const { addNotification, markAllRead, markRead, clearNotifications } = notificationSlice.actions
export default notificationSlice.reducer
