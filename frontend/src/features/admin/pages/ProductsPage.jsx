import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchAdminProducts, deleteProduct } from '../adminSlice'
import { formatCurrency } from '../../../utils/formatters'
import Spinner from '../../../components/common/Spinner'
import Pagination from '../../../components/common/Pagination'

const ProductsPage = () => {
  const dispatch = useDispatch()
  const { products, meta, loading } = useSelector((s) => s.admin)
  const [page, setPage] = useState(1)

  useEffect(() => { dispatch(fetchAdminProducts({ page, limit: 20 })) }, [dispatch, page])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    const r = await dispatch(deleteProduct(id))
    if (deleteProduct.fulfilled.match(r)) toast.success('Product deleted')
    else toast.error(r.payload || 'Delete failed')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Add Product
        </Link>
      </div>

      {loading && products.length === 0 ? (
        <Spinner className="py-20" />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs text-gray-500">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = p.images?.[0]?.url
                  return (
                    <tr key={p._id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={img ? `http://localhost:5000${img}` : 'https://placehold.co/40x40?text=?'}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                          <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={p.stock === 0 ? 'text-red-500' : 'text-green-600'}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link to={`/admin/products/${p._id}/edit`} className="text-blue-600 hover:underline text-xs">Edit</Link>
                          <button onClick={() => handleDelete(p._id, p.name)} className="text-red-500 hover:underline text-xs">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {products.length === 0 && (
              <p className="text-center text-gray-400 py-10">No products found.</p>
            )}
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export default ProductsPage
