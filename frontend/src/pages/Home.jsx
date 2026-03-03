import { useState } from 'react'
import { Link } from 'react-router-dom'
import VoiceAssistant from '../components/features/VoiceAssistant'
import BackToTop from '../components/common/BackToTop'
import TrustBadges from '../components/common/TrustBadges'
import { useAnimatedCounter } from '../hooks/useAnimatedCounter'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const Home = () => {
  const [language, setLanguage] = useState('hi')
  const [statsRef, isStatsVisible] = useScrollAnimation()
  const [openFaq, setOpenFaq] = useState(null)
  
  // Animated counters
  const userCount = useAnimatedCounter(10000, 2000, isStatsVisible)
  const villageCount = useAnimatedCounter(500, 2000, isStatsVisible)
  const satisfactionCount = useAnimatedCounter(95, 2000, isStatsVisible)
  const features = [
    {
      id: 'document',
      title: 'Document Simplifier',
      titleHi: 'दस्तावेज़ समझें',
      description: 'किसी भी कानूनी दस्तावेज़ की फोटो अपलोड करें, AI सरल हिंदी में समझाएगा',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'voice',
      title: 'Voice Complaint',
      titleHi: 'आवाज़ से बताएं',
      description: 'अपनी समस्या बोलकर बताएं, AI सुनेगा और सही सलाह देगा',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      id: 'help',
      title: 'Legal Aid Finder',
      titleHi: 'सहायता खोजें',
      description: 'नज़दीकी मुफ्त कानूनी सहायता केंद्र खोजें',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'draft',
      title: 'FIR & Application Draft',
      titleHi: 'FIR और आवेदन पत्र',
      description: 'AI से FIR, पुलिस शिकायत, कोर्ट शपथ पत्र सरल हिंदी में बनवाएं',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'schemes',
      title: 'Scheme Matcher',
      titleHi: 'सरकारी योजना मिलान',
      description: 'आय, जमीन और श्रेणी के आधार पर सरकारी योजनाएं ढूंढें',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-2.761 0-5 2.015-5 4.5S9.239 17 12 17s5-2.015 5-4.5S14.761 8 12 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v3m0 12v3m-9-9h3m12 0h3m-2.636-6.364l-2.121 2.121m-8.486 8.486l-2.121 2.121m0-12.728l2.121 2.121m8.486 8.486l2.121 2.121" />
        </svg>
      )
    },
    {
      id: 'legal-rights',
      title: 'Legal Rights Guide',
      titleHi: 'कानूनी अधिकार जानें',
      description: 'पुलिस, गिरफ्तारी, FIR, जमानत से जुड़े आपके कानूनी अधिकार समझें',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25c0 5.105 3.07 9.772 7.5 11.743m0-13c5.5 0 10 4.745 10 11.25 0 5.105-3.07 9.772-7.5 11.743m0-13v13m9-13c.821-.692 1.53-1.56 2.05-2.585m0 13.75c-.81.689-1.56 1.548-2.05 2.585" />
        </svg>
      )
    }
  ]

  const testimonials = [
    {
      name: 'रामेश्वर यादव',
      location: 'गाँव: रामपुर, बिहार',
      text: 'FIR लिखने में बहुत मदद मिली। AI ने सरल हिंदी में सब समझाया। धन्यवाद!',
      rating: 5,
      case: 'FIR मामला'
    },
    {
      name: 'सुनीता देवी',
      location: 'गाँव: भगवानपुर, UP',
      text: 'कानूनी दस्तावेज़ समझने में मुश्किल होती थी। अब Legal Saathi से आसान हो गया।',
      rating: 5,
      case: 'संपत्ति विवाद'
    },
    {
      name: 'मोहन सिंह',
      location: 'गाँव: खेड़ी, राजस्थान',
      text: 'सरकारी योजना की जानकारी मिली। अब मुझे मेरा हक मिल गया।',
      rating: 5,
      case: 'सरकारी योजना'
    }
  ]

  const faqs = [
    {
      question: 'क्या यह सेवा सच में मुफ्त है?',
      answer: 'हाँ, Legal Saathi की सभी मूल सेवाएं पूरी तरह से मुफ्त हैं। हम ग्रामीण भारत को कानूनी मदद देने के लिए प्रतिबद्ध हैं।'
    },
    {
      question: 'क्या AI सलाह भरोसेमंद है?',
      answer: 'हमारा AI भारतीय कानून पर प्रशिक्षित है और सटीक जानकारी देता है। लेकिन जटिल मामलों में हम आपको वकील से मिलने की सलाह देते हैं।'
    },
    {
      question: 'मुझे इंटरनेट नहीं आता, क्या करूं?',
      answer: 'आप Voice Assistant का इस्तेमाल कर सकते हैं - बस बोलिए और AI सुनेगा। कोई टाइपिंग की जरूरत नहीं।'
    },
    {
      question: 'मेरी जानकारी सुरक्षित रहेगी?',
      answer: 'हाँ, आपकी सभी जानकारी एन्क्रिप्टेड और पूरी तरह सुरक्षित है। हम आपकी गोपनीयता का पूरा ध्यान रखते हैं।'
    },
    {
      question: 'किन-किन भाषाओं में सेवा उपलब्ध है?',
      answer: 'वर्तमान में हिंदी और अंग्रेजी में उपलब्ध है। जल्द ही अन्य क्षेत्रीय भाषाएं भी जोड़ी जाएंगी।'
    }
  ]

  const steps = [
    { step: '1', title: 'Upload / Speak', titleHi: 'अपलोड करें या बोलें' },
    { step: '2', title: 'AI Analysis', titleHi: 'AI विश्लेषण' },
    { step: '3', title: 'Get Solution', titleHi: 'समाधान पाएं' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚖️</span>
            </div>
            <span className="font-semibold text-gray-800">Legal Saathi</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-saffron-500 bg-white"
            >
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
            </select>
            <Link
              to="/auth"
              className="px-4 py-2 bg-saffron-500 text-white text-sm font-medium rounded-lg hover:bg-saffron-600 transition-colors"
            >
              Start
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-saffron-50 text-saffron-600 text-xs font-medium rounded-full mb-4">
              AI-Powered Legal Assistance
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              गाँव के लिए Digital कानूनी साथी
            </h1>
            <p className="text-gray-600 mb-6">
              AI की मदद से कानूनी सहायता - अपने दस्तावेज समझें, समस्या बताएं, हिंदी में।
            </p>
            <div className="flex gap-3">
              <Link
                to="/auth"
                className="px-5 py-2.5 bg-saffron-500 text-white text-sm font-medium rounded-lg hover:bg-saffron-600 transition-colors"
              >
                अभी शुरू करें
              </Link>
              <a
                href="#features"
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats - Animated */}
          <div ref={statsRef} className="flex gap-8 mt-10 pt-6 border-t border-gray-100">
            <div>
              <p className="text-2xl font-bold text-gray-900">{userCount.toLocaleString()}+</p>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{villageCount}+</p>
              <p className="text-sm text-gray-500">Villages Reached</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{satisfactionCount}%</p>
              <p className="text-sm text-gray-500">Satisfaction Rate</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* Rural Impact Section */}
      <section className="py-12 bg-gradient-to-b from-saffron-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              गाँव के लोगों के लिए कानूनी शक्ति
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-2">
              हम भारत के गांवों को कानूनी ज्ञान से सशक्त बना रहे हैं। अब कानून से डरने की जरूरत नहीं - आपके अधिकार, आपकी भाषा में।
            </p>
            <p className="text-saffron-600 font-medium">
              Empowering Rural India - No Fear, Just Rights
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="/images/anilsharma26-village-7773706_1920.jpg" 
                alt="Rural village life"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="/images/ravendrasingh-people-7462886_1920.jpg" 
                alt="Rural community"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="/images/bsbasan-rural-4342078_1920.jpg" 
                alt="Rural landscape"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="/images/anilsharma26-pottery-7773694_1920.jpg" 
                alt="Traditional rural crafts"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="/images/swastikarora-man-8043010_1920.jpg" 
                alt="Rural people"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="/images/pankajkr0522-sunset-5312492_1920.jpg" 
                alt="Rural sunset"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Trust Building Messages */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-lg p-5 border border-gray-200 text-center">
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="font-semibold text-gray-900 mb-1">विश्वास के साथ</h3>
              <p className="text-sm text-gray-600">कानून आपके साथ है, आपके खिलाफ नहीं</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 text-center">
              <div className="text-3xl mb-2">💪</div>
              <h3 className="font-semibold text-gray-900 mb-1">सशक्तिकरण</h3>
              <p className="text-sm text-gray-600">अपने अधिकारों को जानें और उनका उपयोग करें</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-1">सुरक्षा</h3>
              <p className="text-sm text-gray-600">कानूनी मुद्दों में अब अकेले नहीं</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Our Features</h2>
            <p className="text-sm text-gray-500 mt-1">AI-powered tools for legal assistance</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.id}
                to={`/dashboard?tab=${feature.id === 'legal-rights' ? 'fear-removal' : feature.id}`}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-saffron-300 transition-colors cursor-pointer hover:shadow-md"
              >
                <div className="w-10 h-10 bg-saffron-50 rounded-lg flex items-center justify-center text-saffron-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{feature.titleHi}</p>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white border-t border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">How It Works</h2>
            <p className="text-sm text-gray-500 mt-1">Simple 3-step process</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-saffron-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.titleHi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              लोगों की सच्ची कहानियाँ
            </h2>
            <p className="text-gray-600">हजारों लोगों ने अपने कानूनी मामलों में Legal Saathi से मदद ली</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-saffron-50 text-saffron-600 text-xs rounded-full">
                    {testimonial.case}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              आम सवाल (FAQ)
            </h2>
            <p className="text-gray-600">आपके मन में होने वाले कानूनी सवालों के जवाब</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed bg-gray-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-saffron-500 to-trust-600">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              अपने कानूनी अधिकार जानें, आज ही!
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              मुफ्त AI-powered कानूनी मदद - कोई छुपा चार्ज नहीं, कोई जटिल प्रक्रिया नहीं
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/auth"
                className="inline-block px-8 py-3 bg-white text-saffron-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                मुफ्त में शुरू करें 🚀
              </Link>
              <a
                href="#features"
                className="inline-block px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                और जानें
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">⚖️</span>
                </div>
                <span className="font-bold text-white text-lg">Legal Saathi</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                ग्रामीण भारत के लिए AI-powered मुफ्त कानूनी सहायता
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-saffron-400 transition-colors">Features</a></li>
                <li><Link to="/auth" className="hover:text-saffron-400 transition-colors">Get Started</Link></li>
                <li><a href="#faq" className="hover:text-saffron-400 transition-colors">FAQ</a></li>
                <li><a href="#testimonials" className="hover:text-saffron-400 transition-colors">Testimonials</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-white mb-3">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-400">Document Analysis</span></li>
                <li><span className="text-gray-400">Voice Complaint</span></li>
                <li><span className="text-gray-400">Legal Aid Finder</span></li>
                <li><span className="text-gray-400">FIR Drafting</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-3">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <span className="text-gray-400">help@legalsaathi.org</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span className="text-gray-400">1800-XXX-XXXX</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🌐</span>
                  <span className="text-gray-400">Available in हिंदी</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © 2026 Legal Saathi. All rights reserved. Made with ❤️ for Rural India
            </p>
            <div className="flex gap-4 text-xs">
              <a href="#" className="hover:text-saffron-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-saffron-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-saffron-400 transition-colors">Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Voice Assistant */}
      <VoiceAssistant />
      
      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}

export default Home
