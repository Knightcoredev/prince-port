// Temporary redirect - individual blog posts handled by static pages
export default function handler(req, res) {
  const { id } = req.query;
  
  // For individual blog posts, redirect to the blog page
  // In a real app, you'd handle individual post fetching here
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Individual blog post API not available. Use static blog pages instead.'
    }
  });
}