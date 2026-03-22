import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    items: [],
    isLoading: false,
    isError: false,
    message: ''
};

// Get menu items
export const getMenuItems = createAsyncThunk('menu/getAll', async () => {
    const response = await axios.get('/api/menu');
    return response.data;
});

// Create menu item (admin)
export const createMenuItem = createAsyncThunk('menu/create', async (menuData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.post('/api/menu', menuData, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMenuItems.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMenuItems.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(getMenuItems.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.error.message;
            })
            .addCase(createMenuItem.fulfilled, (state, action) => {
                state.items.push(action.payload);
            });
    }
});

export default menuSlice.reducer;