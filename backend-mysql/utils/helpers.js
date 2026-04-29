const generateOrderId = () => {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${ts}-${rand}`;
};

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
 * Parse query-string filters for product listing.
 * Returns plain values (no DB-specific operators) so the service layer
 * can translate them to Sequelize WHERE clauses.
 */
const parseQueryFilters = (query) => {
  const {
    page     = 1,
    limit    = 12,
    sort     = '-createdAt',
    search,
    category,
    minPrice,
    maxPrice,
  } = query;

  const filters = {};
  if (search)   filters.search   = search;
  if (category) filters.category = category;
  if (minPrice) filters.minPrice = Number(minPrice);
  if (maxPrice) filters.maxPrice = Number(maxPrice);

  return {
    filters,
    page:  parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), 100),
    sort,
  };
};

module.exports = { generateOrderId, getPaginationMeta, parseQueryFilters };
