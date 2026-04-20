import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 mt-16">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div>
        <h3 className="text-white font-semibold mb-3">ShopMERN</h3>
        <p className="text-sm">Your one-stop e-commerce destination. Quality products, fast delivery.</p>
      </div>
      <div>
        <h4 className="text-white font-medium mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/"          className="hover:text-white">Home</Link></li>
          <li><Link to="/products"  className="hover:text-white">Products</Link></li>
          <li><Link to="/cart"      className="hover:text-white">Cart</Link></li>
          <li><Link to="/account/orders" className="hover:text-white">My Orders</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-medium mb-3">Account</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/login"    className="hover:text-white">Login</Link></li>
          <li><Link to="/register" className="hover:text-white">Register</Link></li>
          <li><Link to="/account/profile" className="hover:text-white">Profile</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 text-center py-4 text-xs">
      &copy; {new Date().getFullYear()} ShopMERN. Built with MERN Stack.
    </div>
  </footer>
)

export default Footer
