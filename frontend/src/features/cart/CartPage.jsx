import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchCart, updateCartItem, removeCartItem, clearCartAPI } from './cartSlice'
import { formatCurrency } from '../../utils/formatters'
import Spinner from '../../components/common/Spinner'

const CartPage = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { cart, loading } = useSelector((s) => s.cart)

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const handleQty = async (itemId, qty) => {
    if (qty < 1) return
    const r = await dispatch(updateCartItem({ itemId, quantity: qty }))
    if (updateCartItem.rejected.match(r)) toast.error(r.payload)
  }

  const handleRemove = async (itemId) => {
    const r = await dispatch(removeCartItem(itemId))
    if (removeCartItem.rejected.match(r)) toast.error(r.payload)
    else toast.info('Item removed')
  }

  const handleClear = async () => {
    await dispatch(clearCartAPI())
    toast.info('Cart cleared')
  }

  if (loading && !cart) return <Spinner className="py-20" />

  const items    = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0
  const discount = cart?.discount ?? 0
  const total    = cart?.total ?? 0
  const shipping = subtotal >= 500 ? 0 : 50

  if (items.length === 0) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">&#128722;</div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Add some products to get started.</p>
      <Link to="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700">
        Browse Products
      </Link>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => {
            const product = item.product
            const imgUrl  = product?.images?.[0]?.url
              ? `http://localhost:5000${product.images[0].url}`
              : 'https://placehold.co/80x80?text=No+Img'

            return (
              <div key={item._id} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm">
                <img src={imgUrl} alt={product?.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100 shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product?.name ?? 'Product'}</p>
                  {item.variant?.size  && <p className="text-xs text-gray-500">Size: {item.variant.size}</p>}
                  {item.variant?.color && <p className="text-xs text-gray-500">Color: {item.variant.color}</p>}
                  <p className="text-blue-600 font-semibold mt-1">{formatCurrency(item.price)}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* Qty controls */}
                  <div className="flex items-center border rounded-lg overflow-hidden text-sm">
                    <button onClick={() => handleQty(item._id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">−</button>
                    <span className="px-3 py-1 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQty(item._id, item.quantity + 1)}
                      disabled={item.quantity >= (product?.stock ?? 99)}
                      className="px-2 py-1 hover:bg-gray-100 disabled:opacity-40"
                    >+</button>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  <button onClick={() => handleRemove(item._id)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            )
          })}

          <div className="flex justify-end">
            <button onClick={handleClear} className="text-sm text-gray-400 hover:text-red-500">
              Clear cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatCurrency(discount)}</span></div>}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatCurrency(shipping)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span>
                <span>{formatCurrency(total + shipping)}</span>
              </div>
            </div>
            {subtotal < 500 && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded p-2 mb-3">
                Add {formatCurrency(500 - subtotal)} more for free shipping!
              </p>
            )}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700"
            >
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-blue-600 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
