import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService.js';

const savedToken = localStorage.getItem('mrmobi_token');
let savedUser = null;
try {
  const userStr = localStorage.getItem('mrmobi_user');
  savedUser = userStr ? JSON.parse(userStr) : null;
} catch (e) {
  localStorage.removeItem('mrmobi_user');
}

export const loginAdmin = createAsyncThunk('auth/loginAdmin', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authService.login({
      username: payload.username.trim(),
      password: payload.password.trim(),
    });
    if (!data?.token) {
      return rejectWithValue('Login response did not include a token');
    }
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Invalid username or password');
  }
});

export const signupUser = createAsyncThunk('auth/signupUser', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authService.signupUser({
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password.trim(),
    });
    if (!data?.token) {
      return rejectWithValue('Signup response did not include a token');
    }
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Signup failed');
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authService.loginUser({
      email: payload.email.trim().toLowerCase(),
      password: payload.password.trim(),
    });
    if (!data?.token) {
      return rejectWithValue('Login response did not include a token');
    }
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Invalid email or password');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken,
    user: savedUser,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('mrmobi_token');
      localStorage.removeItem('mrmobi_user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('mrmobi_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          username: action.payload.username || action.meta.arg.username,
          fullName: action.payload.fullName,
          role: action.payload.role || 'ADMIN',
          mobile: action.payload.mobile,
          address: action.payload.address,
          gender: action.payload.gender,
        };
        localStorage.setItem('mrmobi_token', action.payload.token);
        localStorage.setItem('mrmobi_user', JSON.stringify(state.user));
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          username: action.payload.username,
          fullName: action.payload.fullName,
          role: action.payload.role || 'USER',
          mobile: action.payload.mobile,
          address: action.payload.address,
          gender: action.payload.gender,
        };
        localStorage.setItem('mrmobi_token', action.payload.token);
        localStorage.setItem('mrmobi_user', JSON.stringify(state.user));
        toast.success('Account created successfully');
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          username: action.payload.username,
          fullName: action.payload.fullName,
          role: action.payload.role || 'USER',
          mobile: action.payload.mobile,
          address: action.payload.address,
          gender: action.payload.gender,
        };
        localStorage.setItem('mrmobi_token', action.payload.token);
        localStorage.setItem('mrmobi_user', JSON.stringify(state.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
