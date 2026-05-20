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

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    count: 0,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.count += 1;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.productId !== action.payload);
        state.count = Math.max(0, state.count - 1);
      });
  },
});

export default wishlistSlice.reducer;
