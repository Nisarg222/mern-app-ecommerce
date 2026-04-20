import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { addToCart } from '../../cart/cartSlice'
import { formatCurrency } from '../../../utils/formatters'
import useAuth from '../../../hooks/useAuth'

const ProductCard = ({ product }) => {
  const dispatch        = useDispatch()
  const { isAuthenticated } = useAuth()
  const mainImage = product.images?.[0]?.url || '/placeholder.jpg'
  const discount  = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.info('Please login to add items to cart'); return }
    const result = await dispatch(addToCart({ productId: product._id, quantity: 1 }))
    if (addToCart.fulfilled.match(result)) toast.success('Added to cart!')
    else toast.error(result.payload || 'Failed to add to cart')
  }

  return (
    <Link to={`/products/${product.slug}`} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={`http://localhost:5000${mainImage}`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=No+Image' }}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Featured
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-gray-500">{product.category?.name}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
          {product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-xs text-red-500">Out of stock</p>
        )}
      </div>

      {/* Add to cart */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
