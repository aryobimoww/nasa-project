const DEFAULT_PAGE_LIMITS = 0;
function getPagination(query) {
  const page = Math.abs(query.page) || 1;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMITS;
  const skip = (page - 1) * limit;
  return {
    skip,
    limit,
  };
}

module.exports = {
  getPagination,
};
