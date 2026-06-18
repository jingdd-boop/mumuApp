class AppError extends Error {
  constructor(message, { status = 400, code = 40001 } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = AppError;
