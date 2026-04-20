import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import {
  fetchAdminCategories, createCategory, updateCategory, deleteCategory,
} from '../adminSlice'
import Spinner from '../../../components/common/Spinner'

const schema = Yup.object({
  name:        Yup.string().min(2).required('Name is required'),
  description: Yup.string().optional(),
})

const CategoriesPage = () => {
  const dispatch = useDispatch()
  const { categories, loading } = useSelector((s) => s.admin)
  const [editing, setEditing] = useState(null)   // category being edited
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { dispatch(fetchAdminCategories()) }, [dispatch])

  const handleSubmit = async (values, { resetForm }) => {
    const action = editing
      ? dispatch(updateCategory({ id: editing._id, data: values }))
      : dispatch(createCategory(values))

    const result = await action
    const ok = editing ? updateCategory.fulfilled.match(result) : createCategory.fulfilled.match(result)
    if (ok) {
      toast.success(editing ? 'Category updated!' : 'Category created!')
      resetForm()
      setEditing(null)
      setShowForm(false)
    } else {
      toast.error(result.payload || 'Operation failed')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Products in this category won't be deleted.`)) return
    const r = await dispatch(deleteCategory(id))
    if (deleteCategory.fulfilled.match(r)) toast.success('Category deleted')
    else toast.error(r.payload || 'Delete failed')
  }

  const handleEdit = (cat) => {
    setEditing(cat)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Add Category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
          <Formik
            initialValues={{ name: editing?.name ?? '', description: editing?.description ?? '' }}
            validationSchema={schema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            <Form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Field name="name" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Field as="textarea" name="description" rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <Spinner size="sm" />}
                  {editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </Form>
          </Formik>
        </div>
      )}

      {/* List */}
      {loading && categories.length === 0 ? (
        <Spinner className="py-10" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No categories yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{c.description || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => handleDelete(c._id, c.name)} className="text-red-500 hover:underline text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
