import { useSearchParams } from 'react-router-dom'
import ProductListPage from './ProductListPage'

// Search reuses the full product list with the ?q= param pre-filled
const SearchPage = () => {
  const [params] = useSearchParams()
  const query    = params.get('q') || ''

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        Search results for &ldquo;<span className="text-blue-600">{query}</span>&rdquo;
      </h1>
      <ProductListPage />
    </div>
  )
}

export default SearchPage
