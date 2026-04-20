import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
      {children ?? <Outlet />}
    </main>
    <Footer />
  </div>
)

export default Layout
