// Disabled - file upload not needed for static blog
export default function handler(req, res) {
  return res.status(404).json({
    success: false,
    error: { code: 'NOT_AVAILABLE', message: 'Blog upload API disabled' }
  });
}