function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

module.exports = { genId };
