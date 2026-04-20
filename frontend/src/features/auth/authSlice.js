import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/axios'

// ── Thunks ──────────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout') } catch (_) { /* ignore */ }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed')
  }
})

export const addAddress = createAsyncThunk('auth/addAddress', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/addresses', data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add address')
  }
})

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/auth/addresses/${id}`)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete address')
  }
})

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data.message
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send reset link')
  }
})

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/auth/reset-password/${token}`, { password })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Reset failed')
  }
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const persist = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('token', token)
}

const clear = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

const storedUser  = localStorage.getItem('user')
const storedToken = localStorage.getItem('token')

// ── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    storedUser ? JSON.parse(storedUser) : null,
    token:   storedToken || null,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null }
    const rejected = (state, { payload }) => { state.loading = false; state.error = payload }

    const setAuth = (state, { payload }) => {
      state.loading = false
      state.user    = payload.user
      state.token   = payload.token
      persist(payload.user, payload.token)
    }

    builder
      // register
      .addCase(registerUser.pending,   pending)
      .addCase(registerUser.rejected,  rejected)
      .addCase(registerUser.fulfilled, setAuth)
      // login
      .addCase(loginUser.pending,   pending)
      .addCase(loginUser.rejected,  rejected)
      .addCase(loginUser.fulfilled, setAuth)
      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.token = null; clear()
      })
      // fetchMe
      .addCase(fetchMe.pending,  pending)
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false; state.user = null; state.token = null; clear()
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user    = payload.user
        localStorage.setItem('user', JSON.stringify(payload.user))
      })
      // updateProfile
      .addCase(updateProfile.pending,   pending)
      .addCase(updateProfile.rejected,  rejected)
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user    = payload.user
        localStorage.setItem('user', JSON.stringify(payload.user))
      })
      // addAddress / deleteAddress
      .addCase(addAddress.fulfilled, (state, { payload }) => {
        if (state.user) state.user.addresses = payload.addresses
      })
      .addCase(deleteAddress.fulfilled, (state, { payload }) => {
        if (state.user) state.user.addresses = payload.addresses
      })
      // resetPassword
      .addCase(resetPassword.pending,   pending)
      .addCase(resetPassword.rejected,  rejected)
      .addCase(resetPassword.fulfilled, setAuth)
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
