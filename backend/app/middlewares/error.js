const ApiError = require("../api-error");

const notFound = (req, res, next) => {
  next(new ApiError(404, "Không tìm thấy tài nguyên"));
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    statusCode: err.statusCode || 500,
    message: err.message || "Có lỗi xảy ra trên server",
  });
};

module.exports = { notFound, errorHandler };
