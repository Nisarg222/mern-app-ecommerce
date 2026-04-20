import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrders } from './orderSlice'
import { formatCurrency, formatDate, orderStatusBadge, capitalize } from '../../utils/formatters'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'

const OrderListPage = () => {
  const dispatch = useDispatch()
  const { orders, meta, loading } = useSelector((s) => s.orders)
  const [page, setPage] = useState(1)

  useEffect(() => { dispatch(fetchMyOrders({ page, limit: 10 })) }, [dispatch, page])

  if (loading) return <Spinner className="py-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">&#128230;</div>
          <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link to="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/account/orders/${order._id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-900">{order.orderId}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <Badge className={orderStatusBadge(order.orderStatus)}>
                    {capitalize(order.orderStatus)}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{order.items?.length} item(s)</p>
                  <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export default OrderListPage
