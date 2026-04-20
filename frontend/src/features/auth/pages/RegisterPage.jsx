import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { registerUser, clearError } from '../authSlice'
import useAuth from '../../../hooks/useAuth'
import Spinner from '../../../components/common/Spinner'

const schema = Yup.object({
  name:     Yup.string().min(2, 'Min 2 chars').required('Name is required'),
  email:    Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirm:  Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Please confirm password'),
})

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
    return () => dispatch(clearError())
  }, [isAuthenticated, navigate, dispatch])

  const handleSubmit = async ({ name, email, password }) => {
    const result = await dispatch(registerUser({ name, email, password }))
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome aboard.')
      navigate('/')
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Join ShopMERN today</p>

        <Formik
          initialValues={{ name: '', email: '', password: '', confirm: '' }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          <Form className="space-y-4">
            {[
              { name: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'John Doe' },
              { name: 'email',    label: 'Email',            type: 'email',    placeholder: 'you@example.com' },
              { name: 'password', label: 'Password',         type: 'password', placeholder: '••••••••' },
              { name: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <Field
                  name={name} type={type} placeholder={placeholder}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
                <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-1" />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Spinner size="sm" />} Create Account
            </button>
          </Form>
        </Formik>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
