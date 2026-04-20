import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { placeOrder } from '../orders/orderSlice'
import { clearCartLocal } from '../cart/cartSlice'
import { fetchCart } from '../cart/cartSlice'
import { formatCurrency } from '../../utils/formatters'
import Spinner from '../../components/common/Spinner'

const addressSchema = Yup.object({
  street:     Yup.string().required('Street is required'),
  city:       Yup.string().required('City is required'),
  state:      Yup.string().required('State is required'),
  postalCode: Yup.string().required('Postal code is required'),
  country:    Yup.string().required('Country is required'),
})

const PAYMENT_METHODS = [
  { value: 'cod',    label: 'Cash on Delivery' },
  { value: 'stripe', label: 'Credit / Debit Card (mock)' },
]

const CheckoutPage = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { cart }  = useSelector((s) => s.cart)
  const { loading } = useSelector((s) => s.orders)
  const user      = useSelector((s) => s.auth.user)
  const [paymentMethod, setPaymentMethod] = useState('cod')

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const savedAddresses = user?.addresses ?? []
  const [selectedSaved, setSelectedSaved] = useState(savedAddresses[0] ?? null)
  const [useNewAddress, setUseNewAddress] = useState(savedAddresses.length === 0)

  const items    = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0
  const shipping = subtotal >= 500 ? 0 : 50
  const tax      = parseFloat((subtotal * 0.18).toFixed(2))
  const total    = subtotal + shipping + tax

  if (items.length === 0) {
    navigate('/cart', { replace: true })
    return null
  }

  const handleSubmit = async (values) => {
    const shippingAddress = useNewAddress ? values : selectedSaved
    const result = await dispatch(placeOrder({ shippingAddress, paymentMethod }))
    if (placeOrder.fulfilled.match(result)) {
      dispatch(clearCartLocal())
      navigate(`/account/orders/${result.payload._id}?success=1`, { replace: true })
    } else {
      toast.error(result.payload || 'Failed to place order')
    }
  }

  const initialAddress = selectedSaved ?? { street: '', city: '', state: '', postalCode: '', country: 'India' }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Address + Payment */}
        <div className="flex-1 space-y-5">
          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
              <div className="space-y-2 mb-3">
                {savedAddresses.map((addr) => (
                  <label key={addr._id} className={`flex gap-3 p-3 border rounded-lg cursor-pointer ${!useNewAddress && selectedSaved?._id === addr._id ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <input
                      type="radio" name="saved_addr"
                      checked={!useNewAddress && selectedSaved?._id === addr._id}
                      onChange={() => { setSelectedSaved(addr); setUseNewAddress(false) }}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-medium">{addr.label || 'Address'}</p>
                      <p className="text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                    </div>
                  </label>
                ))}
                <label className={`flex gap-3 p-3 border rounded-lg cursor-pointer ${useNewAddress ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <input type="radio" name="saved_addr" checked={useNewAddress} onChange={() => setUseNewAddress(true)} className="mt-1" />
                  <span className="text-sm font-medium">+ Use a new address</span>
                </label>
              </div>
            </div>
          )}

          {/* New address form */}
          {(useNewAddress || savedAddresses.length === 0) && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">{savedAddresses.length > 0 ? 'New Address' : 'Shipping Address'}</h2>
              <Formik
                initialValues={initialAddress}
                validationSchema={addressSchema}
                onSubmit={handleSubmit}
                id="checkout-form"
              >
                {({ submitForm }) => (
                  <Form id="checkout-form" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'street',     label: 'Street',      span: true },
                      { name: 'city',       label: 'City' },
                      { name: 'state',      label: 'State' },
                      { name: 'postalCode', label: 'Postal Code' },
                      { name: 'country',    label: 'Country' },
                    ].map(({ name, label, span }) => (
                      <div key={name} className={span ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <Field name={name} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-1" />
                      </div>
                    ))}
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* Payment method */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(({ value, label }) => (
                <label key={value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === value ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span className="truncate mr-2 text-gray-600">{item.product?.name} ×{item.quantity}</span>
                  <span className="shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <hr className="mb-3" />
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatCurrency(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (18%)</span><span>{formatCurrency(tax)}</span></div>
              <hr />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              onClick={!useNewAddress ? () => handleSubmit(selectedSaved) : undefined}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Spinner size="sm" />}
              Place Order • {formatCurrency(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
