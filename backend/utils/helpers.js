/**
 * Generate a human-readable unique order ID.
 */
const generateOrderId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${ts}-${rand}`;
};

/**
 * Build pagination metadata.
 */
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Parse common query-string filters used across list endpoints.
 * Returns { filters, page, limit, sort }.
 */
const parseQueryFilters = (query) => {
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt',
    search,
    category,
    minPrice,
    maxPrice,
  } = query;

  const filters = {};

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) filters.category = category;

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  return {
    filters,
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), 100),
    sort,
  };
};

module.exports = { generateOrderId, getPaginationMeta, parseQueryFilters };
