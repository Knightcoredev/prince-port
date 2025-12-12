import Head from 'next/head';
import Link from 'next/link';

export default function EcommercePlatformDemo() {
  return (
    <>
      <Head>
        <title>E-Commerce Platform Demo - [Your Name]</title>
        <meta name="description" content="Live demo of the e-commerce platform with shopping cart, product catalog, and payment processing." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/projects" className="text-blue-600 hover:text-blue-800">
                ← Back to Projects
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">E-Commerce Platform Demo</h1>
              <div></div>
            </div>
          </div>
        </header>

        {/* Demo Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">E-Commerce Platform</h2>
              <p className="text-lg text-gray-600 mb-6">
                A full-featured e-commerce platform with user authentication, payment processing, 
                inventory management, and admin dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">🛍️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Shopping Cart</h3>
                <p className="text-gray-600 text-sm">Complete cart functionality with quantity management and checkout process</p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">💳</div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Processing</h3>
                <p className="text-gray-600 text-sm">Secure payment integration with Stripe for safe transactions</p>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
                <p className="text-gray-600 text-sm">Comprehensive admin panel for inventory and order management</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Tech Stack</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['Next.js', 'React', 'Node.js', 'MongoDB', 'Stripe API', 'JWT Auth', 'Tailwind CSS', 'Vercel'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🚀 Demo Status</h4>
              <p className="text-gray-700">
                This e-commerce platform is fully functional with all components implemented. 
                The demo showcases the complete shopping experience from product browsing to checkout.
              </p>
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <Link 
                href="/projects" 
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Projects
              </Link>
              <a 
                href="https://github.com/Knightcoredev/ecommerce-platform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Code
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}