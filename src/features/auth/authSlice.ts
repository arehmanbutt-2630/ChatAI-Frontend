import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, signupApi, refreshTokenApi } from './authApi';

interface AuthState {
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (data: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginApi(data);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await signupApi(data);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Signup failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (refresh_token: string, { rejectWithValue }) => {
    try {
      const response = await refreshTokenApi(refresh_token);
      localStorage.setItem('access_token', response.access_token);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.error = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = action.payload as string;
      })

  },
})

export const { logout } = authSlice.actions;
export default authSlice.reducer;
