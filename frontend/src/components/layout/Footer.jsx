import { useState } from 'react'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  
  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 border border-white rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 border border-white rounded-full"></div>
      </div>
      
      {/* Newsletter Section */}
      <div className="relative border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-saffron-500/10 via-trust-500/10 to-saffron-500/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-gray-800">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  न्याय की खबरें सीधे आपके इनबॉक्स में
                </h3>
                <p className="text-gray-400">
                  नवीनतम कानूनी अपडेट, टिप्स और सरकारी योजनाओं की जानकारी पाएं
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:min-w-[300px]">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="आपका ईमेल पता" 
                    className="w-full px-6 py-4 rounded-full bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                  />
                  <svg className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <button 
                  type="submit"
                  className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    subscribed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gradient-to-r from-saffron-500 to-trust-500 text-white hover:shadow-lg hover:shadow-saffron-500/30 hover:scale-105'
                  }`}
                >
                  {subscribed ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      सब्सक्राइब्ड!
                    </>
                  ) : 'सब्सक्राइब करें'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6 group">
              <div className="w-14 h-14 bg-gradient-to-br from-saffron-500 to-trust-600 rounded-2xl flex items-center justify-center shadow-lg shadow-saffron-500/20 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">⚖</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Rural Legal Saathi</h3>
                <p className="text-gray-400 text-sm">ग्रामीण कानूनी साथी</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              हम भारत के ग्रामीण क्षेत्रों में कानूनी जागरूकता और सहायता प्रदान करने के लिए AI तकनीक का उपयोग करते हैं। 
              हमारा मिशन हर गाँव तक न्याय पहुँचाना है।
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-11 h-11 bg-gray-800/80 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-saffron-500 hover:to-trust-500 hover:scale-110 hover:shadow-lg hover:shadow-saffron-500/20 transition-all duration-300 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-11 h-11 bg-gray-800/80 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/>
                </svg>
              </a>
              <a href="#" className="w-11 h-11 bg-gray-800/80 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-500 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
              </a>
              <a href="#" className="w-11 h-11 bg-gray-800/80 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </a>
              <a href="#" className="w-11 h-11 bg-gray-800/80 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-green-500 hover:to-green-600 hover:scale-110 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">त्वरित लिंक</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-400 hover:text-saffron-400 hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-saffron-400 transition-colors"></span>होम</a></li>
              <li><a href="#solutions" className="text-gray-400 hover:text-saffron-400 hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-saffron-400 transition-colors"></span>सेवाएं</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-saffron-400 hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-saffron-400 transition-colors"></span>कैसे काम करे</a></li>
              <li><a href="#impact" className="text-gray-400 hover:text-saffron-400 hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-saffron-400 transition-colors"></span>प्रभाव</a></li>
              <li><a href="#" className="text-gray-400 hover:text-saffron-400 hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-saffron-400 transition-colors"></span>हमारे बारे में</a></li>
              <li><a href="#" className="text-gray-400 hover:text-saffron-400 hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-saffron-400 transition-colors"></span>FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">संपर्क करें</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gray-800/80 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-saffron-500/20 group-hover:to-trust-500/20 transition-all flex-shrink-0">
                  <svg className="w-5 h-5 text-saffron-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-1">ईमेल</span>
                  <span className="text-gray-300 group-hover:text-saffron-400 transition-colors">help@rurallegalsaathi.in</span>
                </div>
              </li>
              <li className="flex items-start space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gray-800/80 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-green-500/20 group-hover:to-green-600/20 transition-all flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-1">टोल फ्री</span>
                  <span className="text-gray-300 group-hover:text-green-400 transition-colors">+91 1800-XXX-XXXX</span>
                </div>
              </li>
              <li className="flex items-start space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gray-800/80 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-trust-500/20 group-hover:to-trust-600/20 transition-all flex-shrink-0">
                  <svg className="w-5 h-5 text-trust-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-1">पता</span>
                  <span className="text-gray-300 group-hover:text-trust-400 transition-colors">नई दिल्ली, भारत</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="relative border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-yellow-500/5 via-yellow-500/10 to-yellow-500/5 rounded-2xl p-6 backdrop-blur-sm border border-yellow-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h5 className="text-yellow-400 font-semibold mb-2">अस्वीकरण (Disclaimer)</h5>
                <p className="text-gray-400 text-sm leading-relaxed">
                  यह प्लेटफॉर्म केवल सामान्य कानूनी जानकारी प्रदान करता है और पेशेवर कानूनी सलाह का विकल्प नहीं है। 
                  महत्वपूर्ण कानूनी मामलों में कृपया एक योग्य वकील से परामर्श लें। AI द्वारा दी गई जानकारी में त्रुटियाँ हो सकती हैं।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative border-t border-gray-800/50 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-gray-500 text-sm">
                © 2025 Rural Legal Saathi. सर्वाधिकार सुरक्षित।
              </p>
              <div className="hidden md:flex items-center space-x-2 text-gray-600">
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="text-xs">Made with ❤️ in India</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <a href="#" className="text-gray-500 hover:text-saffron-400 transition-colors duration-300">गोपनीयता नीति</a>
              <a href="#" className="text-gray-500 hover:text-saffron-400 transition-colors duration-300">उपयोग की शर्तें</a>
              <a href="#" className="text-gray-500 hover:text-saffron-400 transition-colors duration-300">सहायता</a>
              <a href="#" className="text-gray-500 hover:text-saffron-400 transition-colors duration-300">संपर्क</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
