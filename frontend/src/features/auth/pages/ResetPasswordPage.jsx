import { useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { resetPassword } from '../authSlice'
import Spinner from '../../../components/common/Spinner'
import useAuth from '../../../hooks/useAuth'

const schema = Yup.object({
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirm:  Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Required'),
})

const ResetPasswordPage = () => {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { token }  = useParams()
  const { loading } = useAuth()

  const handleSubmit = async ({ password }) => {
    const result = await dispatch(resetPassword({ token, password }))
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password reset successful!')
      navigate('/')
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your new password below.</p>

        <Formik initialValues={{ password: '', confirm: '' }} validationSchema={schema} onSubmit={handleSubmit}>
          <Form className="space-y-4">
            {[
              { name: 'password', label: 'New Password',      placeholder: '••••••••' },
              { name: 'confirm',  label: 'Confirm Password',  placeholder: '••••••••' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <Field
                  name={name} type="password" placeholder={placeholder}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
                <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-1" />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Spinner size="sm" />} Reset Password
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  )
}

export default ResetPasswordPage
