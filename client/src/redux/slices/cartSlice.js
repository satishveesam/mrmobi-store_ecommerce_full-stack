import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { cartService } from '../../services/cartService';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartService.getCart();
    // Transform backend CartItem structure to frontend item structure
    return data.map(item => ({
      ...item.product,
      id: item.product.id,
      quantity: item.quantity
    }));
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch cart');
  }
});

export const addToCartAsync = createAsyncThunk('cart/addToCart', async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
  try {
    await cartService.addToCart(productId, quantity);
    toast.success('Product added to cart', { toastId: 'cart-add-success' });
    dispatch(fetchCart());
    return { productId, quantity };
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to add to cart');
  }
});

export const updateQuantityAsync = createAsyncThunk('cart/updateQuantity', async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
  try {
    await cartService.updateQuantity(productId, quantity);
    dispatch(fetchCart());
    return { productId, quantity };
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to update quantity');
  }
});

export const removeFromCartAsync = createAsyncThunk('cart/removeFromCart', async (productId, { dispatch, rejectWithValue }) => {
  try {
    await cartService.removeFromCart(productId);
    dispatch(fetchCart());
    return productId;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to remove from cart');
  }
});

export const clearCartAsync = createAsyncThunk('cart/clearCart', async (_, { dispatch, rejectWithValue }) => {
  try {
    await cartService.clearCart();
    dispatch(fetchCart());
    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        // Optimistic update could go here, but for now we rely on fetchCart or explicit actions
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.productId);
        if (item) item.quantity = action.payload.quantity;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
