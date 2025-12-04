export default function Categories() {
  const categories = [
    { name: 'Electronics', icon: '💻', color: 'bg-blue-100' },
    { name: 'Clothing', icon: '👕', color: 'bg-purple-100' },
    { name: 'Home & Garden', icon: '🏡', color: 'bg-green-100' },
    { name: 'Sports', icon: '⚽', color: 'bg-orange-100' },
    { name: 'Books', icon: '📚', color: 'bg-yellow-100' },
    { name: 'Toys', icon: '🎮', color: 'bg-pink-100' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`${category.color} p-6 rounded-lg hover:shadow-lg transition-shadow text-center`}
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-semibold text-gray-900">{category.name}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
