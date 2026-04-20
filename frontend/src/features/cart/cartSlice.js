import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/axios'

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart')
    return res.data.data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart/items', data)
    return res.data.data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add item')
  }
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/cart/items/${itemId}`, { quantity })
    return res.data.data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update item')
  }
})

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/items/${itemId}`)
    return res.data.data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove item')
  }
})

export const clearCartAPI = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart')
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cart: null, loading: false, error: null },
  reducers: {
    clearCartLocal: (state) => { state.cart = null },
    clearError:     (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null }
    const rejected = (state, { payload }) => { state.loading = false; state.error = payload }
    const setCart  = (state, { payload }) => { state.loading = false; state.cart = payload }

    builder
      .addCase(fetchCart.pending,      pending)
      .addCase(fetchCart.rejected,     rejected)
      .addCase(fetchCart.fulfilled,    setCart)
      .addCase(addToCart.pending,      pending)
      .addCase(addToCart.rejected,     rejected)
      .addCase(addToCart.fulfilled,    setCart)
      .addCase(updateCartItem.pending,  pending)
      .addCase(updateCartItem.rejected, rejected)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.pending,  pending)
      .addCase(removeCartItem.rejected, rejected)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(clearCartAPI.fulfilled,  (state) => { state.cart = null; state.loading = false })
  },
})

export const { clearCartLocal, clearError } = cartSlice.actions
export default cartSlice.reducer
