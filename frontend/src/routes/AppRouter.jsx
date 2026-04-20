import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../features/admin/AdminLayout";
import Spinner from "../components/common/Spinner";

// ── Public / Auth pages (lazy) ───────────────────────────────────────────────
const HomePage = lazy(() => import("../features/products/pages/HomePage"));
const ProductListPage = lazy(() =>
  import("../features/products/pages/ProductListPage"),
);
const ProductDetailPage = lazy(() =>
  import("../features/products/pages/ProductDetailPage"),
);
const SearchPage = lazy(() => import("../features/products/pages/SearchPage"));
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() =>
  import("../features/auth/pages/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() =>
  import("../features/auth/pages/ResetPasswordPage"),
);

// ── User pages (lazy) ────────────────────────────────────────────────────────
const CartPage = lazy(() => import("../features/cart/CartPage"));
const CheckoutPage = lazy(() => import("../features/checkout/CheckoutPage"));
const OrderListPage = lazy(() => import("../features/orders/OrderListPage"));
const OrderConfirmationPage = lazy(() =>
  import("../features/orders/OrderConfirmationPage"),
);
const ProfilePage = lazy(() => import("../features/account/ProfilePage"));
const AddressesPage = lazy(() => import("../features/account/AddressesPage"));

// ── Admin pages (lazy) ───────────────────────────────────────────────────────
const DashboardPage = lazy(() =>
  import("../features/admin/pages/DashboardPage"),
);
const ProductsPage = lazy(() => import("../features/admin/pages/ProductsPage"));
const ProductFormPage = lazy(() =>
  import("../features/admin/pages/ProductFormPage"),
);
const CategoriesPage = lazy(() =>
  import("../features/admin/pages/CategoriesPage"),
);
const AdminOrdersPage = lazy(() =>
  import("../features/admin/pages/AdminOrdersPage"),
);
const UsersPage = lazy(() => import("../features/admin/pages/UsersPage"));

const Loading = () => <Spinner className="min-h-[60vh]" />;

const AppRouter = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      {/* ── Public ── */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ── Protected (user must be logged in) ── */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/orders"
          element={
            <ProtectedRoute>
              <OrderListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/orders/:id"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/addresses"
          element={
            <ProtectedRoute>
              <AddressesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ── Admin (admin role required) ── */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrdersPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
              <p className="text-gray-500 mb-6">Page not found.</p>
              <a href="/" className="text-blue-600 hover:underline">
                Go Home
              </a>
            </div>
          </Layout>
        }
      />
    </Routes>
  </Suspense>
);

export default AppRouter;
