import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    orders: [],
    pendingOrders: [],
    kitchenOrders: [],
    isLoading: false,
    isError: false,
    message: ''
};

// Create order
export const createOrder = createAsyncThunk('orders/create', async (orderData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.post('/api/orders', orderData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// Get orders
export const getOrders = createAsyncThunk('orders/getAll', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.get('/api/orders', config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// Get pending orders (admin)
export const getPendingOrders = createAsyncThunk('orders/getPending', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.get('/api/orders/pending', config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// Get kitchen orders
export const getKitchenOrders = createAsyncThunk('orders/getKitchen', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.get('/api/orders/kitchen', config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// Approve order (admin)
export const approveOrder = createAsyncThunk('orders/approve', async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.put(`/api/orders/${id}/approve`, {}, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// Update order status (kitchen)
export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.put(`/api/orders/${id}/status`, { status }, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders.unshift(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get orders
            .addCase(getOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload;
            })
            .addCase(getOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get pending orders
            .addCase(getPendingOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getPendingOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pendingOrders = action.payload;
            })
            .addCase(getPendingOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get kitchen orders
            .addCase(getKitchenOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getKitchenOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.kitchenOrders = action.payload;
            })
            .addCase(getKitchenOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Approve order
            .addCase(approveOrder.fulfilled, (state, action) => {
                state.pendingOrders = state.pendingOrders.filter(order => order._id !== action.payload._id);
                const index = state.orders.findIndex(order => order._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            // Update order status
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const index = state.kitchenOrders.findIndex(order => order._id === action.payload._id);
                if (index !== -1) {
                    state.kitchenOrders[index] = action.payload;
                }
                const allOrdersIndex = state.orders.findIndex(order => order._id === action.payload._id);
                if (allOrdersIndex !== -1) {
                    state.orders[allOrdersIndex] = action.payload;
                }
            });
    }
});

export const { reset } = orderSlice.actions;
export default orderSlice.reducer;