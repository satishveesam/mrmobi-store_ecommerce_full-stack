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

export const addToCartAsync = createAsyncThunk('cart/addToCart', async ({ productId, quantity, product }, { dispatch, rejectWithValue }) => {
  try {
    toast.success('Product added to cart', { toastId: 'cart-add-success' });
    await cartService.addToCart(productId, quantity);
    // Fetch fresh cart from server in background to sync
    dispatch(fetchCart());
    return { productId, quantity };
  } catch (error) {
    // If backend fail, fetch fresh cart to revert local state
    dispatch(fetchCart());
    return rejectWithValue(error.response?.data || 'Failed to add to cart');
  }
});

export const updateQuantityAsync = createAsyncThunk('cart/updateQuantity', async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
  try {
    await cartService.updateQuantity(productId, quantity);
    return { productId, quantity };
  } catch (error) {
    dispatch(fetchCart());
    return rejectWithValue(error.response?.data || 'Failed to update quantity');
  }
});

export const removeFromCartAsync = createAsyncThunk('cart/removeFromCart', async (productId, { dispatch, rejectWithValue }) => {
  try {
    toast.success('Item removed from cart', { toastId: 'cart-remove-success' });
    await cartService.removeFromCart(productId);
    return productId;
  } catch (error) {
    dispatch(fetchCart());
    return rejectWithValue(error.response?.data || 'Failed to remove from cart');
  }
});

export const clearCartAsync = createAsyncThunk('cart/clearCart', async (_, { dispatch, rejectWithValue }) => {
  try {
    await cartService.clearCart();
    return null;
  } catch (error) {
    dispatch(fetchCart());
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
        if (state.items.length === 0) {
          state.loading = true;
        }
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCartAsync.pending, (state) => {
        state.items = [];
      })
      .addCase(addToCartAsync.pending, (state, action) => {
        const { product, quantity } = action.meta.arg;
        if (product) {
          const existingItem = state.items.find(i => i.id === product.id);
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            state.items.push({
              ...product,
              id: product.id,
              quantity
            });
          }
        }
      })
      .addCase(updateQuantityAsync.pending, (state, action) => {
        const { productId, quantity } = action.meta.arg;
        const item = state.items.find(i => i.id === productId);
        if (item) item.quantity = quantity;
      })
      .addCase(removeFromCartAsync.pending, (state, action) => {
        const productId = action.meta.arg;
        state.items = state.items.filter(i => i.id !== productId);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
