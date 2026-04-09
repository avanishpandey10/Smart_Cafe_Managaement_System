import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api'

export const fetchMenu = createAsyncThunk('menu/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/menu')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch menu')
  }
})

export const createMenuItem = createAsyncThunk('menu/create', async (itemData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/menu', itemData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create item')
  }
})

export const updateMenuItem = createAsyncThunk('menu/update', async ({ id, ...itemData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/menu/${id}`, itemData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update item')
  }
})

export const deleteMenuItem = createAsyncThunk('menu/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/menu/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete item')
  }
})

const menuSlice = createSlice({
  name: 'menu',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => { state.loading = true })
      .addCase(fetchMenu.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchMenu.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(createMenuItem.fulfilled, (state, action) => { state.items.push(action.payload) })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i._id === action.payload._id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload)
      })
  },
})

export default menuSlice.reducer
