import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { wishlistService } from '../../services/wishlistService';

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const { data } = await wishlistService.getWishlist();
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch wishlist');
  }
});

export const fetchWishlistCount = createAsyncThunk('wishlist/fetchCount', async (_, { rejectWithValue }) => {
  try {
    const { data } = await wishlistService.getWishlistCount();
    return data.count;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch wishlist count');
  }
});

export const addToWishlistAsync = createAsyncThunk('wishlist/addToWishlist', async (productId, { dispatch, rejectWithValue }) => {
  try {
    await wishlistService.addToWishlist(productId);
    toast.success('Added to wishlist', { toastId: 'wishlist-add-success' });
    dispatch(fetchWishlist());
    dispatch(fetchWishlistCount());
    return productId;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add to wishlist', { toastId: 'wishlist-add-error' });
    return rejectWithValue(error.response?.data || 'Failed to add to wishlist');
  }
});

export const removeFromWishlistAsync = createAsyncThunk('wishlist/removeFromWishlist', async (productId, { dispatch, rejectWithValue }) => {
  try {
    await wishlistService.removeFromWishlist(productId);
    dispatch(fetchWishlist());
    dispatch(fetchWishlistCount());
    return productId;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to remove from wishlist');
  }
});

const cachedWishlist = (() => {
  try {
    const data = localStorage.getItem('mrmobi_cached_wishlist');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
})();

const cachedWishlistCount = (() => {
  try {
    const count = localStorage.getItem('mrmobi_cached_wishlist_count');
    return count ? Number(count) : 0;
  } catch (e) {
    return 0;
  }
})();

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: cachedWishlist,
    count: cachedWishlistCount,
    loading: cachedWishlist.length === 0,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = Array.isArray(action.payload) ? action.payload : [];
        state.items = newItems;
        try {
          localStorage.setItem('mrmobi_cached_wishlist', JSON.stringify(newItems));
        } catch (e) {
          console.error(e);
        }
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload;
        try {
          localStorage.setItem('mrmobi_cached_wishlist_count', String(action.payload));
        } catch (e) {
          console.error(e);
        }
      })
      .addCase(addToWishlistAsync.pending, (state, action) => {
        state.count += 1;
        // Optimistically add item to wishlist items
        const productId = action.meta.arg;
        const exists = state.items.some(item => item.productId === productId);
        if (!exists) {
          state.items.push({ productId });
        }
      })
      .addCase(removeFromWishlistAsync.pending, (state, action) => {
        const productId = action.meta.arg;
        state.items = state.items.filter(item => item.productId !== productId);
        state.count = Math.max(0, state.count - 1);
      });
  },
});

export default wishlistSlice.reducer;
