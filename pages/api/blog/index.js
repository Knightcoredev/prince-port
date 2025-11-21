// Temporary redirect to static blog API to avoid bcrypt issues
export default function handler(req, res) {
  // Redirect to static blog API
  return res.redirect(307, '/api/blog-static' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
}