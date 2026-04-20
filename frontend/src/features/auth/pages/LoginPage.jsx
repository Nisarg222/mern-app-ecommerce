import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { loginUser, clearError } from '../authSlice'
import useAuth from '../../../hooks/useAuth'
import Spinner from '../../../components/common/Spinner'

const schema = Yup.object({
  email:    Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
})

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
    return () => dispatch(clearError())
  }, [isAuthenticated, navigate, dispatch])

  const handleSubmit = async (values) => {
    const result = await dispatch(loginUser(values))
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!')
      navigate('/')
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Login to your ShopMERN account</p>

        <Formik initialValues={{ email: '', password: '' }} validationSchema={schema} onSubmit={handleSubmit}>
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Field
                name="email" type="email" placeholder="you@example.com"
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
              </div>
              <Field
                name="password" type="password" placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Spinner size="sm" />} Login
            </button>
          </Form>
        </Formik>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
