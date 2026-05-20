import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { productService } from '../../services/productService.js';
import { fallbackProducts } from '../../utils/constants.js';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (search = '', { rejectWithValue }) => {
  try {
    const { data } = await productService.getProducts(search);
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const saveProduct = createAsyncThunk('products/saveProduct', async ({ id, values }, { rejectWithValue }) => {
  try {
    const response = id ? await productService.updateProduct(id, values) : await productService.createProduct(values);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Product save failed');
  }
});

export const removeProduct = createAsyncThunk('products/removeProduct', async (id, { rejectWithValue }) => {
  try {
    await productService.deleteProduct(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Product delete failed');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
    usingFallback: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.usingFallback = false;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
        state.items = fallbackProducts;
        state.usingFallback = true;
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
        else state.items.unshift(action.payload);
        toast.success('Product saved');
      })
      .addCase(saveProduct.rejected, (_, action) => toast.error(action.payload))
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        toast.success('Product deleted');
      })
      .addCase(removeProduct.rejected, (_, action) => toast.error(action.payload));
  },
});

export default productSlice.reducer;
