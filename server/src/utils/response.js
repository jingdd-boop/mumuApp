function success(res, data, message = 'ok') {
  res.json({ code: 0, message, data });
}

function fail(res, message, { status = 400, code = 40001 } = {}) {
  res.status(status).json({ code, message, data: null });
}

module.exports = { success, fail };
