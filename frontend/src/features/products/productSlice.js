import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/axios'

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/products', { params })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load products')
  }
})

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/featured')
    return res.data.data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchProductBySlug = createAsyncThunk('products/bySlug', async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${slug}`)
    return res.data.data.product
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found')
  }
})

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/categories')
    return res.data.data.categories
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items:      [],
    featured:   [],
    categories: [],
    selected:   null,
    meta:       null,
    loading:    false,
    error:      null,
  },
  reducers: {
    clearSelected: (state) => { state.selected = null },
    clearError:    (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(fetchProducts.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false
        state.items   = payload.products
        state.meta    = payload.meta
      })
      .addCase(fetchFeatured.fulfilled, (state, { payload }) => { state.featured = payload })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => { state.categories = payload })
      .addCase(fetchProductBySlug.pending,   (state) => { state.loading = true;  state.selected = null })
      .addCase(fetchProductBySlug.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(fetchProductBySlug.fulfilled, (state, { payload }) => {
        state.loading  = false
        state.selected = payload
      })
  },
})

export const { clearSelected, clearError } = productSlice.actions
export default productSlice.reducer
