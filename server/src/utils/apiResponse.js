/**
 * Standardized API response formatters
 */

export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, items = [], page = 1, limit = 10, total = 0, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      currentPage: Number(page),
      limit: Number(limit),
      totalItems: Number(total),
      totalPages: Math.ceil(total / limit) || 1
    },
    timestamp: new Date().toISOString()
  });
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse
};
