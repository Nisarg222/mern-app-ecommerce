import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { addAddress, deleteAddress } from '../auth/authSlice'
import useAuth from '../../hooks/useAuth'
import Spinner from '../../components/common/Spinner'

const schema = Yup.object({
  label:      Yup.string().optional(),
  street:     Yup.string().required('Street is required'),
  city:       Yup.string().required('City is required'),
  state:      Yup.string().required('State is required'),
  postalCode: Yup.string().required('Postal code is required'),
  country:    Yup.string().required('Country is required'),
  isDefault:  Yup.boolean(),
})

const BLANK = { label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false }

const AddressesPage = () => {
  const dispatch          = useDispatch()
  const { user, loading } = useAuth()
  const [showForm, setShowForm] = useState(false)

  const addresses = user?.addresses ?? []

  const handleAdd = async (values, { resetForm }) => {
    const result = await dispatch(addAddress(values))
    if (addAddress.fulfilled.match(result)) {
      toast.success('Address added!')
      resetForm()
      setShowForm(false)
    } else {
      toast.error(result.payload || 'Failed to add address')
    }
  }

  const handleDelete = async (id) => {
    const result = await dispatch(deleteAddress(id))
    if (deleteAddress.fulfilled.match(result)) toast.info('Address removed')
    else toast.error(result.payload || 'Failed to remove address')
  }

  return (
    <div className="max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Address'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">New Address</h2>
          <Formik initialValues={BLANK} validationSchema={schema} onSubmit={handleAdd}>
            <Form className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'label',      label: 'Label',       span: false, placeholder: 'Home / Office' },
                { name: 'street',     label: 'Street',      span: true,  placeholder: '123 Main St' },
                { name: 'city',       label: 'City',        span: false, placeholder: 'Mumbai' },
                { name: 'state',      label: 'State',       span: false, placeholder: 'Maharashtra' },
                { name: 'postalCode', label: 'Postal Code', span: false, placeholder: '400001' },
                { name: 'country',    label: 'Country',     span: false, placeholder: 'India' },
              ].map(({ name, label, span, placeholder }) => (
                <div key={name} className={span ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <Field
                    name={name} placeholder={placeholder}
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-0.5" />
                </div>
              ))}

              <div className="sm:col-span-2 flex items-center gap-2">
                <Field type="checkbox" name="isDefault" id="isDefault" className="w-4 h-4" />
                <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default address</label>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Spinner size="sm" />} Save Address
                </button>
              </div>
            </Form>
          </Formik>
        </div>
      )}

      {/* List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">&#127968;</div>
          <p>No addresses saved yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr._id} className={`bg-white rounded-xl p-4 shadow-sm flex justify-between items-start gap-3 ${addr.isDefault ? 'border border-blue-400' : ''}`}>
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{addr.label || 'Address'}</span>
                  {addr.isDefault && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Default</span>}
                </div>
                <p className="text-gray-600">{addr.street}</p>
                <p className="text-gray-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                <p className="text-gray-500">{addr.country}</p>
              </div>
              <button
                onClick={() => handleDelete(addr._id)}
                className="text-xs text-red-500 hover:underline shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AddressesPage
