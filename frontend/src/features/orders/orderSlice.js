import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/axios'

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', data)
    return res.data.data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to place order')
  }
})

export const fetchMyOrders = createAsyncThunk('orders/myOrders', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders', { params })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchOrderById = createAsyncThunk('orders/byId', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/orders/${id}`)
    return res.data.data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Order not found')
  }
})

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/orders/${id}/cancel`)
    return res.data.data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel order')
  }
})

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], selected: null, meta: null, loading: false, error: null },
  reducers: {
    clearSelected: (state) => { state.selected = null },
    clearError:    (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(placeOrder.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(placeOrder.fulfilled, (state, { payload }) => { state.loading = false; state.selected = payload })
      .addCase(fetchMyOrders.pending,  (state) => { state.loading = true })
      .addCase(fetchMyOrders.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(fetchMyOrders.fulfilled, (state, { payload }) => {
        state.loading = false; state.orders = payload.orders; state.meta = payload.meta
      })
      .addCase(fetchOrderById.pending,   (state) => { state.loading = true;  state.selected = null })
      .addCase(fetchOrderById.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(fetchOrderById.fulfilled, (state, { payload }) => { state.loading = false; state.selected = payload })
      .addCase(cancelOrder.fulfilled, (state, { payload }) => {
        state.selected = payload
        state.orders   = state.orders.map((o) => o._id === payload._id ? payload : o)
      })
  },
})

export const { clearSelected, clearError } = orderSlice.actions
export default orderSlice.reducer
