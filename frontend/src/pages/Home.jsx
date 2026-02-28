import { Link } from 'react-router-dom'
import VoiceAssistant from '../components/features/VoiceAssistant'

const Home = () => {
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

  const stats = [
    { value: '10K+', label: 'Users' },
    { value: '500+', label: 'Villages' },
    { value: '95%', label: 'Satisfaction' }
  ]

  const steps = [
    { step: '1', title: 'Upload / Speak', titleHi: 'अपलोड करें या बोलें' },
    { step: '2', title: 'AI Analysis', titleHi: 'AI विश्लेषण' },
    { step: '3', title: 'Get Solution', titleHi: 'समाधान पाएं' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚖️</span>
            </div>
            <span className="font-semibold text-gray-800">Legal Saathi</span>
          </Link>
          <Link
            to="/auth"
            className="px-4 py-2 bg-saffron-500 text-white text-sm font-medium rounded-lg hover:bg-saffron-600 transition-colors"
          >
            Start
          </Link>
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

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-6 border-t border-gray-100">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
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

      {/* CTA Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-saffron-500 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              Ready to get started?
            </h2>
            <p className="text-saffron-100 text-sm mb-6">
              Access free legal assistance in Hindi
            </p>
            <Link
              to="/auth"
              className="inline-block px-6 py-2.5 bg-white text-saffron-600 text-sm font-medium rounded-lg hover:bg-saffron-50 transition-colors"
            >
              Start Now - Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-saffron-500 rounded flex items-center justify-center">
              <span className="text-white text-xs">⚖️</span>
            </div>
            <span className="text-sm text-gray-600">Legal Saathi</span>
          </div>
          <p className="text-xs text-gray-500">© 2026 Legal Saathi. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Voice Assistant */}
      <VoiceAssistant />
    </div>
  )
}

export default Home
