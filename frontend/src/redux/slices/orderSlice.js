import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api'

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders')
  }
})

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', orderData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create order')
  }
})

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/status`, { status })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update order')
  }
})

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/cancel`)
    return data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel order')
  }
})

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], loading: false, error: null },
  reducers: {
    upsertOrder(state, action) {
      const idx = state.orders.findIndex(o => o._id === action.payload._id)
      if (idx >= 0) state.orders[idx] = action.payload
      else state.orders.unshift(action.payload)
    },
    clearOrderError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(createOrder.fulfilled, (state, action) => { state.orders.unshift(action.payload) })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o._id === action.payload._id)
        if (idx >= 0) state.orders[idx] = action.payload
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o._id === action.payload._id)
        if (idx >= 0) state.orders[idx] = action.payload
      })
  },
})

export const { upsertOrder, clearOrderError } = orderSlice.actions
export default orderSlice.reducer
