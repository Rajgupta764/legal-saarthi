import { useState } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-saffron-500 to-trust-600 rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white text-2xl">⚖</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Rural Legal Saathi</h1>
              <p className="text-xs text-gray-500">ग्रामीण कानूनी साथी</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-saffron-600 font-medium transition-colors">
              होम
            </a>
            <a href="#problems" className="text-gray-700 hover:text-saffron-600 font-medium transition-colors">
              समस्याएं
            </a>
            <a href="#solutions" className="text-gray-700 hover:text-saffron-600 font-medium transition-colors">
              समाधान
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-saffron-600 font-medium transition-colors">
              कैसे काम करे
            </a>
            <a href="#impact" className="text-gray-700 hover:text-saffron-600 font-medium transition-colors">
              प्रभाव
            </a>
            <Link to="/dashboard" className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-2.5 rounded-full font-medium shadow-soft hover:shadow-hover transition-all duration-300">
              शुरू करें
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <a href="#home" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-saffron-600 font-medium transition-colors px-4 py-2">
                होम
              </a>
              <a href="#problems" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-saffron-600 font-medium transition-colors px-4 py-2">
                समस्याएं
              </a>
              <a href="#solutions" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-saffron-600 font-medium transition-colors px-4 py-2">
                समाधान
              </a>
              <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-saffron-600 font-medium transition-colors px-4 py-2">
                कैसे काम करे
              </a>
              <a href="#impact" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-saffron-600 font-medium transition-colors px-4 py-2">
                प्रभाव
              </a>
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-3 rounded-full font-medium mx-4 text-center"
              >
                शुरू करें
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
