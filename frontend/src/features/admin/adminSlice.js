import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/axios'

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchDashboard = createAsyncThunk('admin/dashboard', async (_, { rejectWithValue }) => {
  try { return (await api.get('/admin/dashboard')).data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchAdminProducts = createAsyncThunk('admin/products', async (params = {}, { rejectWithValue }) => {
  try { return (await api.get('/admin/products', { params })).data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createProduct = createAsyncThunk('admin/createProduct', async (formData, { rejectWithValue }) => {
  try {
    return (await api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data.product
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create product') }
})

export const updateProduct = createAsyncThunk('admin/updateProduct', async ({ id, formData }, { rejectWithValue }) => {
  try {
    return (await api.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data.product
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update product') }
})

export const deleteProduct = createAsyncThunk('admin/deleteProduct', async (id, { rejectWithValue }) => {
  try { await api.delete(`/admin/products/${id}`); return id }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete product') }
})

export const fetchAdminCategories = createAsyncThunk('admin/categories', async (_, { rejectWithValue }) => {
  try { return (await api.get('/admin/categories')).data.data.categories }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createCategory = createAsyncThunk('admin/createCategory', async (data, { rejectWithValue }) => {
  try { return (await api.post('/admin/categories', data)).data.data.category }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create category') }
})

export const updateCategory = createAsyncThunk('admin/updateCategory', async ({ id, data }, { rejectWithValue }) => {
  try { return (await api.put(`/admin/categories/${id}`, data)).data.data.category }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update category') }
})

export const deleteCategory = createAsyncThunk('admin/deleteCategory', async (id, { rejectWithValue }) => {
  try { await api.delete(`/admin/categories/${id}`); return id }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete category') }
})

export const fetchAdminOrders = createAsyncThunk('admin/orders', async (params = {}, { rejectWithValue }) => {
  try { return (await api.get('/admin/orders', { params })).data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchAdminOrderById = createAsyncThunk('admin/orderById', async (id, { rejectWithValue }) => {
  try { return (await api.get(`/admin/orders/${id}`)).data.data.order }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateOrderStatus = createAsyncThunk('admin/updateOrderStatus', async ({ id, status, note }, { rejectWithValue }) => {
  try { return (await api.patch(`/admin/orders/${id}/status`, { status, note })).data.data.order }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update status') }
})

export const fetchAdminUsers = createAsyncThunk('admin/users', async (params = {}, { rejectWithValue }) => {
  try { return (await api.get('/admin/users', { params })).data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateUserStatus = createAsyncThunk('admin/updateUserStatus', async ({ id, isActive }, { rejectWithValue }) => {
  try { return (await api.patch(`/admin/users/${id}/status`, { isActive })).data.data.user }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update user') }
})

// ── Slice ─────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    dashboard:     null,
    products:      [],
    categories:    [],
    orders:        [],
    users:         [],
    selectedOrder: null,
    meta:          null,
    loading:       false,
    error:         null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null }
    const rejected = (state, { payload }) => { state.loading = false; state.error = payload }

    builder
      .addCase(fetchDashboard.pending, pending)
      .addCase(fetchDashboard.rejected, rejected)
      .addCase(fetchDashboard.fulfilled, (state, { payload }) => { state.loading = false; state.dashboard = payload })

      .addCase(fetchAdminProducts.pending, pending)
      .addCase(fetchAdminProducts.rejected, rejected)
      .addCase(fetchAdminProducts.fulfilled, (state, { payload }) => {
        state.loading = false; state.products = payload.products; state.meta = payload.meta
      })
      .addCase(createProduct.fulfilled,  (state, { payload }) => { state.products.unshift(payload) })
      .addCase(updateProduct.fulfilled,  (state, { payload }) => {
        state.products = state.products.map((p) => p._id === payload._id ? payload : p)
      })
      .addCase(deleteProduct.fulfilled,  (state, { payload }) => {
        state.products = state.products.filter((p) => p._id !== payload)
      })

      .addCase(fetchAdminCategories.fulfilled, (state, { payload }) => { state.categories = payload })
      .addCase(createCategory.fulfilled,  (state, { payload }) => { state.categories.unshift(payload) })
      .addCase(updateCategory.fulfilled,  (state, { payload }) => {
        state.categories = state.categories.map((c) => c._id === payload._id ? payload : c)
      })
      .addCase(deleteCategory.fulfilled,  (state, { payload }) => {
        state.categories = state.categories.filter((c) => c._id !== payload)
      })

      .addCase(fetchAdminOrders.pending,  pending)
      .addCase(fetchAdminOrders.rejected, rejected)
      .addCase(fetchAdminOrders.fulfilled, (state, { payload }) => {
        state.loading = false; state.orders = payload.orders; state.meta = payload.meta
      })
      .addCase(fetchAdminOrderById.fulfilled, (state, { payload }) => { state.selectedOrder = payload })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.selectedOrder = payload
        state.orders = state.orders.map((o) => o._id === payload._id ? payload : o)
      })

      .addCase(fetchAdminUsers.pending,  pending)
      .addCase(fetchAdminUsers.rejected, rejected)
      .addCase(fetchAdminUsers.fulfilled, (state, { payload }) => {
        state.loading = false; state.users = payload.users; state.meta = payload.meta
      })
      .addCase(updateUserStatus.fulfilled, (state, { payload }) => {
        state.users = state.users.map((u) => u._id === payload._id ? payload : u)
      })
  },
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer
