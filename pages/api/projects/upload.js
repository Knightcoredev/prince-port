// Disabled - file upload not needed for static projects
export default function handler(req, res) {
  return res.status(404).json({
    success: false,
    error: { code: 'NOT_AVAILABLE', message: 'Project upload API disabled' }
  });
}