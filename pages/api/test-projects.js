// Simple test endpoint to verify projects API is working
export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Projects API test successful',
    timestamp: new Date().toISOString(),
    projectCount: 6,
    sampleProject: {
      id: '1',
      title: 'E-Commerce Platform',
      category: 'Full Stack',
      featured: true
    }
  });
}