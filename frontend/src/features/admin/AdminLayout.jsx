import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin',            label: '📊 Dashboard',   end: true },
  { to: '/admin/products',   label: '📦 Products' },
  { to: '/admin/categories', label: '🗂 Categories' },
  { to: '/admin/orders',     label: '🛒 Orders' },
  { to: '/admin/users',      label: '👤 Users' },
]

const AdminLayout = () => (
  <div className="min-h-screen flex bg-gray-100">
    {/* Sidebar */}
    <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-gray-700">
        <p className="text-white font-bold text-lg">ShopMERN</p>
        <p className="text-xs text-gray-400">Admin Panel</p>
      </div>
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-gray-700">
        <NavLink to="/" className="text-xs text-gray-400 hover:text-white">
          &#8592; Back to Store
        </NavLink>
      </div>
    </aside>

    {/* Main content */}
    <main className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </div>
    </main>
  </div>
)

export default AdminLayout
