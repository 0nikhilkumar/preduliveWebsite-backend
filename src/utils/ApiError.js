class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    Error = [],
    stack = ""
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.errors = this.errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace;
    }
  }
}

export { ApiError };
