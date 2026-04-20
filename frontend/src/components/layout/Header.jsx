import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { logoutUser } from '../../features/auth/authSlice'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const Header = () => {
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const { isAuthenticated, isAdmin, user } = useAuth()
  const cart        = useSelector((s) => s.cart.cart)
  const cartCount   = cart?.items?.length ?? 0
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch]     = useState('')

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.info('Logged out')
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">
          ShopMERN
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 hidden sm:flex">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border rounded-l-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm hover:bg-blue-700">
            Search
          </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Cart */}
          <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
            <span className="text-2xl">&#128722;</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"
              >
                <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                <span className="text-xs">&#9660;</span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-8 w-44 bg-white border rounded-lg shadow-lg z-50 py-1"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link to="/account/profile"  className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <Link to="/account/orders"   className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Orders</Link>
                  <Link to="/account/addresses" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Addresses</Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"    className="text-sm text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="sm:hidden px-4 pb-3 flex">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border rounded-l-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm">
          Search
        </button>
      </form>
    </header>
  )
}

export default Header
