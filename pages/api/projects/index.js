// Temporary redirect to static projects API to avoid bcrypt issues
export default function handler(req, res) {
  // Redirect to static projects API
  return res.redirect(307, '/api/projects-static' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
}