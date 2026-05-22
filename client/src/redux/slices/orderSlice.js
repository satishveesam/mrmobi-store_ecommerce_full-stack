import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService.js';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const { data } = await orderService.getOrders();
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load orders');
  }
});

export const fetchDashboard = createAsyncThunk('orders/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const { data } = await orderService.getDashboard();
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load dashboard');
  }
});

const cachedItems = (() => {
  try {
    const data = localStorage.getItem('mrmobi_cached_orders');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
})();

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: cachedItems,
    dashboard: null,
    loading: cachedItems.length === 0,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        try {
          localStorage.setItem('mrmobi_cached_orders', JSON.stringify(action.payload));
        } catch {}
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      });
  },
});

export default orderSlice.reducer;
