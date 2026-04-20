import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchProductBySlug } from '../productSlice'
import { addToCart } from '../../cart/cartSlice'
import { formatCurrency } from '../../../utils/formatters'
import useAuth from '../../../hooks/useAuth'
import Spinner from '../../../components/common/Spinner'

const ProductDetailPage = () => {
  const { slug }    = useParams()
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const { isAuthenticated } = useAuth()
  const { selected: product, loading } = useSelector((s) => s.products)

  const [qty,          setQty]          = useState(1)
  const [activeImg,    setActiveImg]    = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [addingCart,   setAddingCart]   = useState(false)

  useEffect(() => { dispatch(fetchProductBySlug(slug)) }, [slug, dispatch])

  if (loading) return <Spinner className="py-20" />
  if (!product) return <div className="text-center py-20 text-gray-400">Product not found.</div>

  const sizes  = [...new Set(product.variants?.map((v) => v.size).filter(Boolean))]
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Please login to add to cart'); navigate('/login'); return }
    setAddingCart(true)
    const result = await dispatch(addToCart({
      productId: product._id,
      quantity: qty,
      ...(selectedSize && { variant: { size: selectedSize } }),
    }))
    setAddingCart(false)
    if (addToCart.fulfilled.match(result)) toast.success('Added to cart!')
    else toast.error(result.payload || 'Failed to add to cart')
  }

  const images = product.images?.length ? product.images : [{ url: '/placeholder.jpg' }]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square mb-3">
            <img
              src={`http://localhost:5000${images[activeImg]?.url}`}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/500x500?text=No+Image' }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === activeImg ? 'border-blue-600' : 'border-transparent'}`}
                >
                  <img src={`http://localhost:5000${img.url}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-blue-600 mb-1">{product.category?.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
                <span className="bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded font-medium">-{discount}%</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>

          {/* Variants */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded border text-sm ${selectedSize === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'hover:border-gray-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Cart */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 text-lg">-</button>
              <span className="px-4 py-2 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 text-lg">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingCart}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addingCart && <Spinner size="sm" />}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Meta */}
          <div className="text-sm text-gray-500 space-y-1 border-t pt-4">
            {product.brand && <p><span className="font-medium text-gray-700">Brand:</span> {product.brand}</p>}
            <p><span className="font-medium text-gray-700">Stock:</span> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
            {product.tags?.length > 0 && (
              <p><span className="font-medium text-gray-700">Tags:</span> {product.tags.join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
