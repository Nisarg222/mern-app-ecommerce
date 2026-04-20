import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById } from './orderSlice'
import { formatCurrency, formatDateTime, orderStatusBadge, capitalize } from '../../utils/formatters'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'

const OrderConfirmationPage = () => {
  const { id }       = useParams()
  const [params]     = useSearchParams()
  const isSuccess    = params.get('success') === '1'
  const dispatch     = useDispatch()
  const { selected: order, loading } = useSelector((s) => s.orders)

  useEffect(() => { dispatch(fetchOrderById(id)) }, [id, dispatch])

  if (loading) return <Spinner className="py-20" />
  if (!order)  return <div className="text-center py-20 text-gray-400">Order not found.</div>

  return (
    <div className="max-w-2xl mx-auto">
      {isSuccess && (
        <div className="text-center mb-8 bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="text-5xl mb-3">&#10003;</div>
          <h1 className="text-2xl font-bold text-green-800 mb-1">Order Placed!</h1>
          <p className="text-green-600 text-sm">Thank you for your purchase. We&apos;ll confirm shortly.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-5 flex-wrap gap-2">
          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-mono font-semibold text-gray-900">{order.orderId}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
          </div>
          <Badge className={orderStatusBadge(order.orderStatus)}>
            {capitalize(order.orderStatus)}
          </Badge>
        </div>

        {/* Items */}
        <div className="border rounded-xl overflow-hidden mb-5">
          {order.items.map((item) => (
            <div key={item._id} className="flex gap-3 p-3 border-b last:border-b-0">
              <img
                src={item.image ? `http://localhost:5000${item.image}` : 'https://placehold.co/60x60?text=Img'}
                className="w-14 h-14 object-cover rounded-lg bg-gray-100 shrink-0"
                alt={item.name}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                {item.variant?.size && <p className="text-xs text-gray-400">Size: {item.variant.size}</p>}
                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold shrink-0">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="text-sm space-y-1.5 mb-5">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatCurrency(order.discount)}</span></div>}
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
          <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm">
            <p className="font-medium text-gray-700 mb-1">Shipping to</p>
            <p className="text-gray-600">
              {order.shippingAddress.street}, {order.shippingAddress.city},
              {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
          </div>
        )}

        {/* Status history */}
        {order.statusHistory?.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Order Timeline</p>
            <div className="space-y-2">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-medium capitalize">{h.status}</span>
                    {h.note && <span className="text-gray-500"> — {h.note}</span>}
                    <p className="text-xs text-gray-400">{formatDateTime(h.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <Link to="/account/orders" className="flex-1 text-center border border-blue-600 text-blue-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50">
            My Orders
          </Link>
          <Link to="/products" className="flex-1 text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage
