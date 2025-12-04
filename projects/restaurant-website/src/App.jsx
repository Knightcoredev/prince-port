import React, { useState } from 'react';
import { 
  Menu, X, Star, Clock, MapPin, Phone, Mail, 
  ChefHat, Award, Heart, Calendar, ArrowRight 
} from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      category: "Appetizers",
      items: [
        { name: "Truffle Arancini", description: "Crispy risotto balls with black truffle and parmesan", price: "$18" },
        { name: "Burrata Caprese", description: "Fresh burrata with heirloom tomatoes and basil oil", price: "$22" },
        { name: "Tuna Tartare", description: "Yellowfin tuna with avocado and citrus vinaigrette", price: "$26" }
      ]
    },
    {
      category: "Main Courses",
      items: [
        { name: "Osso Buco", description: "Braised veal shank with saffron risotto and gremolata", price: "$48" },
        { name: "Branzino", description: "Mediterranean sea bass with roasted vegetables and lemon", price: "$42" },
        { name: "Dry-Aged Ribeye", description: "28-day aged ribeye with roasted bone marrow and herbs", price: "$65" }
      ]
    },
    {
      category: "Desserts",
      items: [
        { name: "Tiramisu", description: "Classic Italian dessert with espresso and mascarpone", price: "$14" },
        { name: "Chocolate Soufflé", description: "Warm chocolate soufflé with vanilla gelato", price: "$16" },
        { name: "Panna Cotta", description: "Vanilla panna cotta with seasonal berry compote", price: "$12" }
      ]
    }
  ];

  const testimonials = [
    {
      name: "James Mitchell",
      text: "An extraordinary dining experience. Every dish was a masterpiece!",
      rating: 5,
      date: "2 weeks ago"
    },
    {
      name: "Sofia Rodriguez",
      text: "The ambiance is perfect for special occasions. Highly recommend the tasting menu.",
      rating: 5,
      date: "1 month ago"
    },
    {
      name: "David Chen",
      text: "Impeccable service and incredible flavors. Worth every penny!",
      rating: 5,
      date: "3 weeks ago"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <ChefHat className="w-8 h-8 text-primary-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900 font-playfair">Bella Vista</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">Home</a>
              <a href="#menu" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Menu</a>
              <a href="#about" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">About</a>
              <a href="#reviews" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Reviews</a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Contact</a>
              <a href="#" className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors font-medium">
                Reserve Table
              </a>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              <a href="#home" className="block px-3 py-2 text-base font-medium text-gray-900">Home</a>
              <a href="#menu" className="block px-3 py-2 text-base font-medium text-gray-700">Menu</a>
              <a href="#about" className="block px-3 py-2 text-base font-medium text-gray-700">About</a>
              <a href="#reviews" className="block px-3 py-2 text-base font-medium text-gray-700">Reviews</a>
              <a href="#contact" className="block px-3 py-2 text-base font-medium text-gray-700">Contact</a>
              <a href="#" className="block px-3 py-2 text-base font-medium bg-primary-600 text-white rounded-lg">Reserve Table</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 relative h-screen flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop&crop=center" 
            alt="Restaurant Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-7xl font-bold font-playfair leading-tight mb-6">
            Fine Dining
            <span className="block text-gold-400">Redefined</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience culinary artistry in an atmosphere of elegance and sophistication. 
            Where every meal becomes an unforgettable memory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-600 text-white px-8 py-4 rounded-full hover:bg-primary-700 transition-all transform hover:scale-105 flex items-center justify-center text-lg font-semibold">
              Reserve Your Table
              <Calendar className="ml-2 w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-gray-900 transition-colors text-lg font-semibold">
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 font-playfair mb-6">
                A Culinary Journey Like No Other
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Bella Vista, we believe dining is an art form. Our award-winning chef combines 
                traditional Italian techniques with modern innovation to create dishes that tell a story.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Every ingredient is carefully sourced from local farms and artisanal producers, 
                ensuring the highest quality and freshest flavors in every bite.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <Award className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">Michelin Star</div>
                  <div className="text-sm text-gray-600">2023 Award</div>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
              </div>

              <button className="bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors font-medium">
                Meet Our Chef
              </button>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop&crop=center" 
                alt="Chef at work" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <ChefHat className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">Chef Marco</p>
                    <p className="text-sm text-gray-600">25+ Years Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 font-playfair mb-4">
              Our Signature Menu
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Crafted with passion, served with pride. Each dish tells a story of tradition and innovation.
            </p>
          </div>

          <div className="space-y-12">
            {menuItems.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 font-playfair mb-8 text-center border-b border-gray-200 pb-4">
                  {category.category}
                </h3>
                <div className="space-y-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h4>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="ml-4">
                        <span className="text-xl font-bold text-primary-600">{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-full hover:bg-primary-700 transition-colors font-medium">
              View Full Menu & Wine List
            </button>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 font-playfair mb-4">
              What Our Guests Say
            </h2>
            <p className="text-xl text-gray-600">
              Every review tells a story of exceptional dining experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  </div>
                  <div className="text-sm text-gray-500">{testimonial.date}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-4 bg-gray-50 px-6 py-4 rounded-full">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold-400 fill-current" />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-900">4.9/5</span>
              <span className="text-gray-600">Based on 500+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hours & Location */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold font-playfair mb-8">Visit Us</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-primary-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-gray-300">123 Culinary Avenue<br />Downtown District, NY 10001</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-primary-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Hours</h3>
                    <div className="text-gray-300 space-y-1">
                      <p>Monday - Thursday: 5:00 PM - 10:00 PM</p>
                      <p>Friday - Saturday: 5:00 PM - 11:00 PM</p>
                      <p>Sunday: 4:00 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-primary-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Reservations</h3>
                    <p className="text-gray-300">(555) 123-DINE</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold font-playfair mb-8">Reserve Your Table</h2>
              <div className="bg-gray-800 p-8 rounded-xl">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                      <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white">
                        <option>5:00 PM</option>
                        <option>6:00 PM</option>
                        <option>7:00 PM</option>
                        <option>8:00 PM</option>
                        <option>9:00 PM</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Guests</label>
                      <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white">
                        <option>2 Guests</option>
                        <option>3 Guests</option>
                        <option>4 Guests</option>
                        <option>5+ Guests</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input type="tel" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Special Requests</label>
                    <textarea rows="3" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white" placeholder="Dietary restrictions, celebrations, etc."></textarea>
                  </div>
                  
                  <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                    Reserve Table
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ChefHat className="w-8 h-8 text-primary-600 mr-2" />
                <h3 className="text-2xl font-bold font-playfair">Bella Vista</h3>
              </div>
              <p className="text-gray-400">
                Fine dining redefined. Where culinary artistry meets exceptional service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Menu</li>
                <li>Reservations</li>
                <li>Private Events</li>
                <li>Gift Cards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>(555) 123-DINE</li>
                <li>info@bellavista.com</li>
                <li>123 Culinary Avenue</li>
                <li>New York, NY 10001</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Instagram</li>
                <li>Facebook</li>
                <li>Twitter</li>
                <li>OpenTable</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
              <p className="mb-4 md:mb-0">&copy; 2024 Bella Vista. All rights reserved.</p>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">Crafted by</span>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg tracking-wider shadow-lg">
                  P.F.O
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;