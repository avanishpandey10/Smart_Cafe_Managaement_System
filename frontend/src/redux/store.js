import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import orderReducer from './slices/orderSlice'
import menuReducer from './slices/menuSlice'
import notificationReducer from './slices/notificationSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    menu: menuReducer,
    notifications: notificationReducer,
  },
})

export default store
