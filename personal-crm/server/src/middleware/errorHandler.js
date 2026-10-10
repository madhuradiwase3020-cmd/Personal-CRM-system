export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map(item => item.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid record identifier' });
  if (err.code === 11000) return res.status(409).json({ message: 'An account with this email already exists' });
  return res.status(err.status || 500).json({ message: err.message || 'An unexpected server error occurred' });
}
