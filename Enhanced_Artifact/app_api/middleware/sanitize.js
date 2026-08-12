// Guards against NoSQL injection attempts where an attacker submits a Mongo
// operator (e.g. { "$gt": "" }) instead of a plain string/number in a body,
// query, or params field. Mongoose casting already blocks a lot of this, but
// this stops it before it ever reaches a query and gives a clear 400 instead
// of relying on that as the only line of defense.
function containsOperatorKey(value) {
  if (Array.isArray(value)) {
    return value.some(containsOperatorKey);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).some(
      (key) => key.startsWith('$') || containsOperatorKey(value[key])
    );
  }
  return false;
}

const sanitizeInput = (req, res, next) => {
  if (
    containsOperatorKey(req.body) ||
    containsOperatorKey(req.query) ||
    containsOperatorKey(req.params)
  ) {
    return res.status(400).json({ message: 'Invalid characters in request data' });
  }
  next();
};

module.exports = sanitizeInput;
