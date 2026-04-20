import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchAdminOrders, fetchAdminOrderById, updateOrderStatus } from '../adminSlice'
import { formatCurrency, formatDateTime, orderStatusBadge, capitalize } from '../../../utils/formatters'
import Badge from '../../../components/common/Badge'
import Spinner from '../../../components/common/Spinner'
import Pagination from '../../../components/common/Pagination'

const STATUS_OPTIONS = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const AdminOrdersPage = () => {
  const dispatch = useDispatch()
  const { orders, selectedOrder, meta, loading } = useSelector((s) => s.admin)
  const [page, setPage]       = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [viewId, setViewId]   = useState(null)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    const params = { page, limit: 20 }
    if (statusFilter) params.status = statusFilter
    dispatch(fetchAdminOrders(params))
  }, [dispatch, page, statusFilter])

  const handleView = (id) => {
    setViewId(id)
    dispatch(fetchAdminOrderById(id))
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    const r = await dispatch(updateOrderStatus({ id: viewId, status: newStatus }))
    if (updateOrderStatus.fulfilled.match(r)) toast.success('Status updated')
    else toast.error(r.payload || 'Failed to update status')
    setNewStatus('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Filter bar */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">All Statuses</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled','returned'].map((s) => (
            <option key={s} value={s}>{capitalize(s)}</option>
          ))}
        </select>
        {meta && <p className="text-xs text-gray-400 self-center">{meta.total} orders</p>}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className={`flex-1 ${viewId ? 'hidden lg:block' : ''}`}>
          {loading && orders.length === 0 ? <Spinner className="py-20" /> : (
            <>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-xs text-gray-500">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className={`border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${viewId === o._id ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3 font-mono font-medium text-xs">{o.orderId}</td>
                        <td className="px-4 py-3">{o.user?.name ?? '—'}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(o.total)}</td>
                        <td className="px-4 py-3">
                          <Badge className={orderStatusBadge(o.orderStatus)}>{capitalize(o.orderStatus)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(o.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleView(o._id)} className="text-blue-600 hover:underline text-xs">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders found.</p>}
              </div>
              <Pagination meta={meta} onPageChange={setPage} />
            </>
          )}
        </div>

        {/* Order detail panel */}
        {viewId && selectedOrder?._id === viewId && (
          <div className="lg:w-96 bg-white rounded-2xl shadow-sm p-5 shrink-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono font-semibold text-sm">{selectedOrder.orderId}</p>
                <p className="text-xs text-gray-400">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setViewId(null)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
            </div>

            <Badge className={`${orderStatusBadge(selectedOrder.orderStatus)} mb-4`}>
              {capitalize(selectedOrder.orderStatus)}
            </Badge>

            {/* Items */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {selectedOrder.items?.map((item) => (
                <div key={item._id} className="flex justify-between text-xs">
                  <span className="text-gray-600 truncate mr-2">{item.name} ×{item.quantity}</span>
                  <span className="shrink-0 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="text-sm font-bold flex justify-between mb-4 border-t pt-2">
              <span>Total</span><span>{formatCurrency(selectedOrder.total)}</span>
            </div>

            {/* Update status */}
            {!['delivered','cancelled','returned'].includes(selectedOrder.orderStatus) && (
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Update Status</p>
                <div className="flex gap-2">
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500">
                    <option value="">-- Select --</option>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || loading}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-40"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrdersPage
