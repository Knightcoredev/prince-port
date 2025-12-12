import React, { useState } from 'react';
import { 
  Menu, X, Cloud, Shield, Zap, Users, CheckCircle, Star, 
  ArrowRight, Play, BarChart3, Globe, Smartphone 
} from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Cloud className="w-8 h-8 text-primary-600" />,
      title: "Cloud-First Architecture",
      description: "Built for the cloud with 99.9% uptime guarantee and global CDN distribution."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and advanced threat protection."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: "Lightning Fast",
      description: "Optimized performance with sub-100ms response times worldwide."
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Team Collaboration",
      description: "Real-time collaboration tools with advanced permission management."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-600" />,
      title: "Advanced Analytics",
      description: "Comprehensive insights and reporting with customizable dashboards."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary-600" />,
      title: "Mobile Ready",
      description: "Native mobile apps for iOS and Android with offline capabilities."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Basic analytics",
        "Email support",
        "Mobile apps"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Best for growing businesses",
      features: [
        "Up to 25 team members",
        "100GB storage",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Custom integrations"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large organizations",
      features: [
        "Unlimited team members",
        "1TB storage",
        "Custom analytics",
        "24/7 phone support",
        "Advanced API",
        "Custom integrations",
        "Dedicated account manager"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Alex Thompson",
      company: "TechCorp",
      role: "CTO",
      text: "CloudSync transformed our workflow. We've seen 40% increase in productivity.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Sarah Kim",
      company: "StartupXYZ",
      role: "CEO",
      text: "The best investment we've made. ROI was positive within the first month.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      company: "Global Inc",
      role: "VP Operations",
      text: "Seamless integration and incredible support. Highly recommended!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
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
                <Cloud className="w-8 h-8 text-primary-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">CloudSync</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">Testimonials</a>
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
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-700">Pricing</a>
              <a href="#testimonials" className="block px-3 py-2 text-base font-medium text-gray-700">Testimonials</a>
              <a href="#" className="block px-3 py-2 text-base font-medium text-gray-700">Login</a>
              <a href="#" className="block px-3 py-2 text-base font-medium bg-primary-600 text-white rounded-lg">Start Free Trial</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-16 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              New: AI-Powered Automation Features
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
              The Future of
              <span className="text-primary-600"> Cloud Collaboration</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Streamline your workflow, boost productivity, and scale your business with our 
              next-generation cloud platform trusted by 50,000+ teams worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-primary-600 text-white px-8 py-4 rounded-full hover:bg-primary-700 transition-all transform hover:scale-105 flex items-center justify-center text-lg font-semibold shadow-lg">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-primary-600 hover:text-primary-600 transition-colors flex items-center justify-center text-lg font-semibold">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&crop=center" 
                alt="CloudSync Dashboard" 
                className="rounded-2xl shadow-2xl border border-gray-200"
              />
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 mb-8">Trusted by industry leaders</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Microsoft</div>
            <div className="text-2xl font-bold text-gray-400">Google</div>
            <div className="text-2xl font-bold text-gray-400">Amazon</div>
            <div className="text-2xl font-bold text-gray-400">Spotify</div>
            <div className="text-2xl font-bold text-gray-400">Airbnb</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to streamline your workflow and accelerate your business growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-primary-100 text-lg">Active Teams</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
              <div className="text-primary-100 text-lg">Uptime</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-primary-100 text-lg">Countries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-primary-100 text-lg">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your team. Upgrade or downgrade at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-primary-600 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
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

                <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about CloudSync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join 50,000+ teams who have already revolutionized their productivity with CloudSync.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-600 text-white px-8 py-4 rounded-full hover:bg-primary-700 transition-colors text-lg font-semibold">
              Start Free Trial - No Credit Card Required
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-gray-900 transition-colors text-lg font-semibold">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Cloud className="w-8 h-8 text-primary-600 mr-2" />
                <h3 className="text-2xl font-bold">CloudSync</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The next-generation cloud platform that helps teams collaborate, 
                innovate, and scale their business faster than ever before.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Status</li>
                <li>API Docs</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <p className="text-gray-400">&copy; 2024 CloudSync. All rights reserved.</p>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">Crafted by</span>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg tracking-wider shadow-lg">
                  [Your Initials]
                </div>
              </div>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;