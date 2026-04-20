import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboard } from '../adminSlice'
import { formatCurrency, formatDateTime, orderStatusBadge, capitalize } from '../../../utils/formatters'
import Badge from '../../../components/common/Badge'
import Spinner from '../../../components/common/Spinner'

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${color}`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <div className="text-3xl mt-2 opacity-20">{icon}</div>
  </div>
)

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { dashboard, loading } = useSelector((s) => s.admin)

  useEffect(() => { dispatch(fetchDashboard()) }, [dispatch])

  if (loading && !dashboard) return <Spinner className="py-20" />

  const { stats, recentOrders } = dashboard ?? { stats: {}, recentOrders: [] }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users"    value={stats.totalUsers    ?? 0} icon="👤" color="border-blue-500" />
        <StatCard label="Total Products" value={stats.totalProducts ?? 0} icon="📦" color="border-green-500" />
        <StatCard label="Total Orders"   value={stats.totalOrders   ?? 0} icon="🛒" color="border-purple-500" />
        <StatCard label="Revenue"        value={formatCurrency(stats.revenue ?? 0)} icon="💰" color="border-orange-500" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/admin/products',   label: 'Manage Products',   color: 'bg-blue-50   text-blue-700' },
          { to: '/admin/categories', label: 'Manage Categories', color: 'bg-green-50  text-green-700' },
          { to: '/admin/orders',     label: 'View Orders',       color: 'bg-purple-50 text-purple-700' },
          { to: '/admin/users',      label: 'Manage Users',      color: 'bg-orange-50 text-orange-700' },
        ].map(({ to, label, color }) => (
          <Link key={to} to={to} className={`${color} rounded-xl p-4 text-center text-sm font-medium hover:opacity-80 transition`}>
            {label}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 pr-4">Order ID</th>
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Total</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-mono font-medium">
                      <Link to={`/admin/orders/${o._id}`} className="text-blue-600 hover:underline">
                        {o.orderId}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4">{o.user?.name ?? '—'}</td>
                    <td className="py-2.5 pr-4 font-semibold">{formatCurrency(o.total)}</td>
                    <td className="py-2.5 pr-4">
                      <Badge className={orderStatusBadge(o.orderStatus)}>{capitalize(o.orderStatus)}</Badge>
                    </td>
                    <td className="py-2.5 text-gray-400">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
