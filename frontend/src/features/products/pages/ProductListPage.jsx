import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, fetchCategories } from '../productSlice'
import ProductCard from './ProductCard'
import Spinner from '../../../components/common/Spinner'
import Pagination from '../../../components/common/Pagination'
import useDebounce from '../../../hooks/useDebounce'

const SORT_OPTIONS = [
  { label: 'Newest',       value: '-createdAt' },
  { label: 'Price: Low',   value: 'price' },
  { label: 'Price: High',  value: '-price' },
  { label: 'Name: A–Z',    value: 'name' },
]

const ProductListPage = () => {
  const dispatch   = useDispatch()
  const [params, setParams] = useSearchParams()
  const { items, categories, meta, loading } = useSelector((s) => s.products)

  const [search,   setSearch]   = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || '')
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '')
  const [sort,     setSort]     = useState(params.get('sort') || '-createdAt')
  const [page,     setPage]     = useState(Number(params.get('page')) || 1)

  const debouncedSearch = useDebounce(search)

  useEffect(() => { dispatch(fetchCategories()) }, [dispatch])

  useEffect(() => {
    const q = {}
    if (debouncedSearch) q.search   = debouncedSearch
    if (category)        q.category = category
    if (minPrice)        q.minPrice = minPrice
    if (maxPrice)        q.maxPrice = maxPrice
    q.sort  = sort
    q.page  = page
    q.limit = 12
    setParams(q)
    dispatch(fetchProducts(q))
  }, [debouncedSearch, category, minPrice, maxPrice, sort, page, dispatch, setParams])

  const handleCategoryChange = (val) => { setCategory(val); setPage(1) }
  const handleSortChange     = (val) => { setSort(val);     setPage(1) }

  return (
    <div className="flex gap-6">
      {/* Sidebar filters */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="bg-white rounded-xl p-4 shadow-sm sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>

          {/* Category */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Category</p>
            <button
              onClick={() => handleCategoryChange('')}
              className={`block w-full text-left px-3 py-1.5 rounded text-sm mb-1 ${!category ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => handleCategoryChange(c._id)}
                className={`block w-full text-left px-3 py-1.5 rounded text-sm mb-1 ${category === c._id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Price range */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Price (₹)</p>
            <div className="flex gap-2">
              <input
                type="number" placeholder="Min" value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1) }}
                className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="number" placeholder="Max" value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }}
                className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="flex-1 min-w-48 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {meta && <p className="text-xs text-gray-500">{meta.total} products</p>}
        </div>

        {loading ? (
          <Spinner className="py-20" />
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products found.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}

export default ProductListPage
