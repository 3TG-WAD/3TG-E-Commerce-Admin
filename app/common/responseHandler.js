class ResponseHandler {
  // Phản hồi thành công
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data || null,
    });
  }

  // Phản hồi lỗi
  static error(res, error, statusCode = 500) {
    // Nếu error là một đối tượng từ mongoose validation
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errorMessages,
      });
    }

    // Các loại lỗi khác
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
      }),
    });
  }

  // Phản hồi không tìm thấy tài nguyên
  static notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      message,
    });
  }

  // Phản hồi xác thực không thành công
  static unauthorized(res, message = "Unauthorized") {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  // Phản hồi cấm truy cập
  static forbidden(res, message = "Forbidden") {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  // Phản hồi yêu cầu không hợp lệ
  static badRequest(res, errors = []) {
    return res.status(400).json({
      success: false,
      message: "Bad Request",
      errors,
    });
  }
}

module.exports = ResponseHandler;
