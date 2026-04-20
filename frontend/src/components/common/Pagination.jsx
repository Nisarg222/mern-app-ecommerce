const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null
  const { page, totalPages } = meta

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex justify-center items-center gap-1 mt-8 flex-wrap">
      <button
        disabled={!meta.hasPrevPage}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-2 rounded border text-sm disabled:opacity-40 hover:bg-gray-100 disabled:cursor-not-allowed"
      >
        &#8592; Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 rounded border text-sm ${
            p === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-2 rounded border text-sm disabled:opacity-40 hover:bg-gray-100 disabled:cursor-not-allowed"
      >
        Next &#8594;
      </button>
    </div>
  )
}

export default Pagination
