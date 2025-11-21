// Temporary redirect - individual projects handled by static pages
export default function handler(req, res) {
  const { id } = req.query;
  
  // For individual projects, redirect to the project detail page
  // In a real app, you'd handle individual project fetching here
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Individual project API not available. Use static project pages instead.'
    }
  });
}