import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import api from '../../../lib/axios'
import Spinner from '../../../components/common/Spinner'

const schema = Yup.object({ email: Yup.string().email('Invalid email').required('Email is required') })

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false)

  const handleSubmit = async ({ email }, { setSubmitting }) => {
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">&#9993;</div>
        <h2 className="text-xl font-bold mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm mb-4">We&apos;ve sent a password reset link to your email address.</p>
        <Link to="/login" className="text-blue-600 hover:underline text-sm">Back to Login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we&apos;ll send you a reset link.</p>

        <Formik initialValues={{ email: '' }} validationSchema={schema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Field
                  name="email" type="email" placeholder="you@example.com"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
                <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Spinner size="sm" />} Send Reset Link
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
