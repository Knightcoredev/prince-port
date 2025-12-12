import React, { useState } from 'react';
import { 
  Menu, X, Zap, Target, Trophy, Users, CheckCircle, Star, 
  ArrowRight, Play, Clock, Calendar, Dumbbell, Heart 
} from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const programs = [
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: "HIIT Transformation",
      description: "High-intensity workouts designed to burn fat and build lean muscle in just 30 minutes.",
      duration: "4 weeks",
      level: "Beginner to Advanced"
    },
    {
      icon: <Dumbbell className="w-8 h-8 text-primary-600" />,
      title: "Strength Builder",
      description: "Progressive strength training program to build serious muscle and increase power.",
      duration: "8 weeks",
      level: "Intermediate"
    },
    {
      icon: <Heart className="w-8 h-8 text-primary-600" />,
      title: "Cardio Blast",
      description: "Fun, energetic cardio workouts that improve endurance and torch calories.",
      duration: "6 weeks",
      level: "All Levels"
    },
    {
      icon: <Target className="w-8 h-8 text-primary-600" />,
      title: "Core Crusher",
      description: "Targeted core workouts to build a strong, defined midsection and improve stability.",
      duration: "4 weeks",
      level: "All Levels"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      result: "Lost 25 lbs in 12 weeks",
      text: "FitPro changed my life! The workouts are challenging but achievable, and the results speak for themselves.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      before: "Before: 165 lbs",
      after: "After: 140 lbs"
    },
    {
      name: "Mike Chen",
      result: "Gained 15 lbs of muscle",
      text: "The strength programs are incredible. I've never been stronger or more confident in my body.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      before: "Before: 150 lbs",
      after: "After: 165 lbs"
    },
    {
      name: "Jessica Martinez",
      result: "Completed first marathon",
      text: "From couch to marathon in 6 months! The cardio programs built my endurance amazingly.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      before: "Before: Sedentary",
      after: "After: Marathon Finisher"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "$29",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Access to all workout programs",
        "Basic nutrition guide",
        "Progress tracking",
        "Community support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "Most popular choice",
      features: [
        "Everything in Basic",
        "Personalized meal plans",
        "1-on-1 coaching calls",
        "Advanced analytics",
        "Priority support",
        "Exclusive content"
      ],
      popular: true
    },
    {
      name: "Elite",
      price: "$99",
      period: "/month",
      description: "For serious athletes",
      features: [
        "Everything in Pro",
        "Custom workout design",
        "Weekly coaching calls",
        "Supplement recommendations",
        "Competition prep",
        "24/7 coach access"
      ],
      popular: false
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
                <Zap className="w-8 h-8 text-primary-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">FitPro</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#programs" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Programs</a>
              <a href="#results" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Results</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Pricing</a>
              <a href="#" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Login</a>
              <a href="#" className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors font-medium">
                Start Free Trial
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
              <a href="#programs" className="block px-3 py-2 text-base font-medium text-gray-700">Programs</a>
              <a href="#results" className="block px-3 py-2 text-base font-medium text-gray-700">Results</a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-700">Pricing</a>
              <a href="#" className="block px-3 py-2 text-base font-medium text-gray-700">Login</a>
              <a href="#" className="block px-3 py-2 text-base font-medium bg-primary-600 text-white rounded-lg">Start Free Trial</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-16 relative min-h-screen flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center" 
            alt="Fitness Training" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium mb-8 border border-primary-600/30">
                <Trophy className="w-4 h-4 mr-2" />
                #1 Fitness App of 2024
              </div>
              
              <h1 className="text-4xl md:text-7xl font-bold leading-tight mb-6">
                Transform Your Body in
                <span className="text-primary-500"> 30 Days</span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
                Join 100,000+ people who've already transformed their lives with our 
                science-backed fitness programs. No gym required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="bg-primary-600 text-white px-8 py-4 rounded-full hover:bg-primary-700 transition-all transform hover:scale-105 flex items-center justify-center text-lg font-bold shadow-lg">
                  Start Your Transformation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center text-lg font-semibold">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Success Stories
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary-500 mb-1">100K+</div>
                  <div className="text-sm text-gray-400">Transformations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-500 mb-1">4.9★</div>
                  <div className="text-sm text-gray-400">App Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-500 mb-1">30 Days</div>
                  <div className="text-sm text-gray-400">Average Results</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Start Your Free Trial</h3>
                <form className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
                  />
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm">
                    <option value="">Select Your Goal</option>
                    <option value="lose-weight">Lose Weight</option>
                    <option value="build-muscle">Build Muscle</option>
                    <option value="get-fit">Get Fit</option>
                    <option value="tone-up">Tone Up</option>
                  </select>
                  <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-bold text-lg">
                    Get Instant Access - FREE
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Proven Programs That Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our scientifically-designed programs, each tailored to deliver maximum results in minimum time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {program.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{program.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      {program.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Target className="w-4 h-4 mr-2" />
                      {program.level}
                    </div>
                  </div>
                  
                  <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                    Start Program
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Real People, Real Results
            </h2>
            <p className="text-xl text-gray-600">
              See the incredible transformations our members have achieved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                      <p className="text-primary-600 font-semibold">{testimonial.result}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{testimonial.before}</span>
                      </div>
                      <div>
                        <span className="text-primary-600 font-semibold">{testimonial.after}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-primary-600 text-white px-8 py-4 rounded-full hover:bg-primary-700 transition-colors font-semibold text-lg">
              See More Success Stories
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Transformation Plan
            </h2>
            <p className="text-xl text-gray-600">
              All plans include a 30-day money-back guarantee. Start your journey risk-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-primary-600 scale-105' : 'border border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xl text-gray-500 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                  plan.popular 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Start {plan.name} Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Your Transformation Starts Today
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Don't wait another day to become the best version of yourself. 
            Join thousands who've already started their journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-white text-primary-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg font-bold">
              Start Free Trial Now
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-primary-600 transition-colors text-lg font-semibold">
              Download App
            </button>
          </div>
          
          <p className="text-primary-100 text-sm">
            ✓ 30-Day Money Back Guarantee  ✓ No Equipment Needed  ✓ Works on Any Device
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Zap className="w-8 h-8 text-primary-600 mr-2" />
                <h3 className="text-2xl font-bold">FitPro</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Transform your body and mind with our science-backed fitness programs. 
                Your journey to a healthier you starts here.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Programs</h4>
              <ul className="space-y-2 text-gray-400">
                <li>HIIT Transformation</li>
                <li>Strength Builder</li>
                <li>Cardio Blast</li>
                <li>Core Crusher</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community</li>
                <li>Success Stories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <p className="text-gray-400">&copy; 2024 FitPro. All rights reserved.</p>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">Crafted by</span>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg tracking-wider shadow-lg">
                  [Your Initials]
                </div>
              </div>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;