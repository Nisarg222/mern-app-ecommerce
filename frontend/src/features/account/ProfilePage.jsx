import { useDispatch } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { updateProfile } from '../auth/authSlice'
import useAuth from '../../hooks/useAuth'
import Spinner from '../../components/common/Spinner'

const schema = Yup.object({
  name:  Yup.string().min(2, 'Min 2 chars').required('Name is required'),
  phone: Yup.string().optional(),
})

const ProfilePage = () => {
  const dispatch      = useDispatch()
  const { user, loading } = useAuth()

  const handleSubmit = async (values) => {
    const result = await dispatch(updateProfile(values))
    if (updateProfile.fulfilled.match(result)) toast.success('Profile updated!')
    else toast.error(result.payload || 'Update failed')
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>
        </div>

        <Formik
          initialValues={{ name: user?.name ?? '', phone: user?.phone ?? '' }}
          validationSchema={schema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <Form className="space-y-4">
            {[
              { name: 'name',  label: 'Full Name',    type: 'text',  placeholder: 'John Doe' },
              { name: 'phone', label: 'Phone Number', type: 'tel',   placeholder: '+91 9876543210' },
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

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot change)</label>
              <input
                value={user?.email ?? ''}
                readOnly
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Spinner size="sm" />} Save Changes
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  )
}

export default ProfilePage
