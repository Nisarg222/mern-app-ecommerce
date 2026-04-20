import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeatured, fetchCategories } from '../productSlice'
import ProductCard from './ProductCard'
import Spinner from '../../../components/common/Spinner'

const HomePage = () => {
  const dispatch   = useDispatch()
  const { featured, categories, loading } = useSelector((s) => s.products)

  useEffect(() => {
    dispatch(fetchFeatured())
    dispatch(fetchCategories())
  }, [dispatch])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-10 mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">Welcome to ShopMERN</h1>
        <p className="text-blue-100 mb-6 text-lg">Discover thousands of products at the best prices</p>
        <Link
          to="/products"
          className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
        >
          Shop Now
        </Link>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="bg-white border rounded-xl px-4 py-3 text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-blue-600 hover:underline">View all &#8594;</Link>
        </div>

        {loading ? (
          <Spinner className="py-12" />
        ) : featured.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Promo banner */}
      <section className="mt-12 bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-orange-800 mb-2">Free Shipping on Orders Over ₹500!</h3>
        <p className="text-orange-600 text-sm">No code needed — discount applied automatically at checkout.</p>
      </section>
    </div>
  )
}

export default HomePage
