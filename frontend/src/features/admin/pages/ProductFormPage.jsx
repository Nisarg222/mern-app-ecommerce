import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { createProduct, updateProduct, fetchAdminCategories } from '../adminSlice'
import { fetchAdminProducts } from '../adminSlice'
import Spinner from '../../../components/common/Spinner'

const schema = Yup.object({
  name:        Yup.string().min(2).required('Name is required'),
  description: Yup.string().required('Description is required'),
  price:       Yup.number().min(0).required('Price is required'),
  category:    Yup.string().required('Category is required'),
  stock:       Yup.number().min(0).integer().required('Stock is required'),
  comparePrice:Yup.number().min(0).optional(),
  brand:       Yup.string().optional(),
  isFeatured:  Yup.boolean(),
})

const ProductFormPage = () => {
  const { id }     = useParams()
  const isEdit     = Boolean(id)
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const fileRef    = useRef()
  const { categories, products, loading } = useSelector((s) => s.admin)

  const existing = isEdit ? products.find((p) => p._id === id) : null

  useEffect(() => {
    dispatch(fetchAdminCategories())
    if (isEdit && products.length === 0) dispatch(fetchAdminProducts({ limit: 100 }))
  }, [dispatch, isEdit, products.length])

  const handleSubmit = async (values) => {
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => fd.append(k, v))
    if (fileRef.current?.files) {
      Array.from(fileRef.current.files).forEach((f) => fd.append('images', f))
    }

    const action = isEdit
      ? dispatch(updateProduct({ id, formData: fd }))
      : dispatch(createProduct(fd))

    const result = await action
    const matched = isEdit ? updateProduct.fulfilled.match(result) : createProduct.fulfilled.match(result)

    if (matched) {
      toast.success(isEdit ? 'Product updated!' : 'Product created!')
      navigate('/admin/products')
    } else {
      toast.error(result.payload || 'Operation failed')
    }
  }

  const initialValues = {
    name:         existing?.name         ?? '',
    description:  existing?.description  ?? '',
    price:        existing?.price        ?? '',
    comparePrice: existing?.comparePrice ?? '',
    category:     existing?.category?._id ?? '',
    stock:        existing?.stock        ?? 0,
    brand:        existing?.brand        ?? '',
    isFeatured:   existing?.isFeatured   ?? false,
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
          <Form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <Field name="name" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <Field as="textarea" name="description" rows={4}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
                <ErrorMessage name="description" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <Field name="price" type="number" min="0"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <ErrorMessage name="price" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Compare price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price (₹)</label>
                <Field name="comparePrice" type="number" min="0"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <Field as="select" name="category"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="">-- Select --</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </Field>
                <ErrorMessage name="category" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <Field name="stock" type="number" min="0"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <ErrorMessage name="stock" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <Field name="brand" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2 mt-2">
                <Field type="checkbox" name="isFeatured" id="isFeatured" className="w-4 h-4" />
                <label htmlFor="isFeatured" className="text-sm text-gray-700">Featured product</label>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images {isEdit && <span className="text-gray-400 font-normal">(leave empty to keep current)</span>}
              </label>
              <input ref={fileRef} type="file" multiple accept="image/*"
                className="w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:border-0 file:bg-blue-50 file:text-blue-700 file:rounded" />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Spinner size="sm" />}
                {isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={() => navigate('/admin/products')}
                className="px-5 py-2.5 border rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  )
}

export default ProductFormPage
