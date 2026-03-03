import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import all components
import DocumentUpload from './DocumentUpload'
import VoiceComplaint from './VoiceComplaint'
import LegalHelpFinder from './LegalHelpFinder'
import DraftGenerator from './DraftGenerator'
import SchemeMatcher from './SchemeMatcher'
import LegalFearRemovalMode from './LegalFearRemovalMode'
import Chatbot from './Chatbot'
import VoiceAssistant from './VoiceAssistant'
import CaseAnalytics from './CaseAnalytics'
import LegalTipsWidget from './LegalTipsWidget'
import CommunityQA from './CommunityQA'
import EmergencyContact from './EmergencyContact'
import UserProgressTracker from './UserProgressTracker'
import DocumentManager from './DocumentManager'
import LawyerNetwork from './LawyerNetwork'

const DashboardHome = ({ onSelectFeature, activeTab }) => {
  const navigate = useNavigate()

  // Organized feature categories with icons and descriptions
  const featureCategories = [
    {
      name: 'कानूनी उपकरण',
      title: 'Legal Tools',
      icon: '🛠️',
      description: 'AI-powered legal assistance',
      features: [
        {
          id: 'document',
          icon: '📄',
          title: 'Document Simplifier',
          titleHi: 'दस्तावेज़ समझें',
          desc: 'किसी भी कानूनी दस्तावेज़ को AI से समझें',
          status: 'active',
          color: 'blue'
        },
        {
          id: 'voice',
          icon: '🎤',
          title: 'Voice Complaint',
          titleHi: 'आवाज़ से बताएं',
          desc: 'अपनी समस्या बोलकर बताएं',
          status: 'active',
          color: 'purple'
        },
        {
          id: 'draft',
          icon: '📝',
          title: 'FIR & Draft Generator',
          titleHi: 'FIR और आवेदन पत्र',
          desc: 'कानूनी दस्तावेज़ तैयार करें',
          status: 'active',
          color: 'green'
        },
        {
          id: 'helpfinder',
          icon: '🗺️',
          title: 'Legal Aid Finder',
          titleHi: 'सहायता खोजें',
          desc: 'नजदीकी कानूनी सहायता केंद्र खोजें',
          status: 'active',
          color: 'orange'
        }
      ]
    },
    {
      name: 'कानूनी सीखना',
      title: 'Learn Legal Knowledge',
      icon: '📚',
      description: 'Empower yourself with legal knowledge',
      features: [
        {
          id: 'tips',
          icon: '💡',
          title: 'Daily Legal Tips',
          titleHi: 'कानूनी सुझाव',
          desc: 'प्रतिदिन नए कानूनी ज्ञान सीखें',
          status: 'active',
          color: 'yellow'
        },
        {
          id: 'fear-removal',
          icon: '🛡️',
          title: 'Legal Rights Guide',
          titleHi: 'कानूनी संरक्षण',
          desc: 'अपने अधिकार जानें और समझें',
          status: 'active',
          color: 'red'
        },
        {
          id: 'community-qa',
          icon: '💬',
          title: 'Q&A Community',
          titleHi: 'सवाल-जवाब',
          desc: 'विशेषज्ञों से सवाल करें और जवाब पाएं',
          status: 'active',
          color: 'cyan'
        },
        {
          id: 'schemes',
          icon: '💰',
          title: 'Scheme Finder',
          titleHi: 'सरकारी योजनाएं',
          desc: 'अपने लिए उपयुक्त योजनाएं खोजें',
          status: 'active',
          color: 'indigo'
        }
      ]
    },
    {
      name: 'मेरी जानकारी',
      title: 'My Legal Profile',
      icon: '👤',
      description: 'Manage your legal journey',
      features: [
        {
          id: 'progress',
          icon: '🏅',
          title: 'My Progress',
          titleHi: 'मेरी प्रगति',
          desc: 'अपने कानूनी सीखने की प्रगति देखें',
          status: 'active',
          color: 'pink'
        },
        {
          id: 'documents',
          icon: '📁',
          title: 'My Documents',
          titleHi: 'मेरे दस्तावेज़',
          desc: 'सभी कानूनी दस्तावेज़ सुरक्षित रखें',
          status: 'active',
          color: 'gray'
        },
        {
          id: 'analytics',
          icon: '📊',
          title: 'Case Analytics',
          titleHi: 'केस विश्लेषण',
          desc: 'प्लेटफॉर्म पर कुल प्रभाव देखें',
          status: 'active',
          color: 'teal'
        },
        {
          id: 'lawyers',
          icon: '⚖️',
          title: 'Lawyer Network',
          titleHi: 'वकील नेटवर्क',
          desc: 'विशेषज्ञ वकीलों से सलाह लें',
          status: 'premium',
          color: 'violet'
        }
      ]
    },
    {
      name: 'तत्काल सहायता',
      title: 'Emergency & Support',
      icon: '🆘',
      description: 'Get help when you need it most',
      features: [
        {
          id: 'emergency',
          icon: '📞',
          title: 'Emergency Hotlines',
          titleHi: 'आपातकालीन हेल्पलाइन',
          desc: '24/7 तुरंत सहायता के लिए कॉल करें',
          status: 'active',
          color: 'red'
        },
        {
          id: 'chatbot',
          icon: '🤖',
          title: 'AI Chat Support',
          titleHi: 'AI सहायक',
          desc: '24/7 AI से तुरंत जवाब पाएं',
          status: 'active',
          color: 'blue'
        },
        {
          id: 'voice-assistant',
          icon: '🎙️',
          title: 'Voice Assistant',
          titleHi: 'आवाज़ सहायक',
          desc: 'आवाज़ से कोई भी सवाल पूछें',
          status: 'active',
          color: 'green'
        }
      ]
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400 text-blue-700',
      purple: 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400 text-purple-700',
      green: 'from-green-50 to-green-100 border-green-200 hover:border-green-400 text-green-700',
      orange: 'from-orange-50 to-orange-100 border-orange-200 hover:border-orange-400 text-orange-700',
      yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 hover:border-yellow-400 text-yellow-700',
      red: 'from-red-50 to-red-100 border-red-200 hover:border-red-400 text-red-700',
      cyan: 'from-cyan-50 to-cyan-100 border-cyan-200 hover:border-cyan-400 text-cyan-700',
      indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-400 text-indigo-700',
      pink: 'from-pink-50 to-pink-100 border-pink-200 hover:border-pink-400 text-pink-700',
      gray: 'from-gray-50 to-gray-100 border-gray-200 hover:border-gray-400 text-gray-700',
      teal: 'from-teal-50 to-teal-100 border-teal-200 hover:border-teal-400 text-teal-700',
      violet: 'from-violet-50 to-violet-100 border-violet-200 hover:border-violet-400 text-violet-700'
    }
    return colors[color] || colors.blue
  }

  const handleFeatureClick = (featureId) => {
    onSelectFeature(featureId)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-saffron-500 via-orange-500 to-red-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">स्वागत है! 🙏</h1>
        <p className="text-white/90 mb-4">आप एक साथ कई कानूनी उपकरणों का उपयोग कर सकते हैं</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          <p className="text-sm text-white/80">Legal Saathi आपके सभी कानूनी प्रश्नों का एक-एक समाधान है</p>
        </div>
      </div>

      {/* Feature Categories */}
      {featureCategories.map((category, idx) => (
        <div key={idx}>
          {/* Category Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h2 className="text-l font-bold text-gray-900">{category.name}</h2>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {category.features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.id)}
                className={`bg-gradient-to-br ${getColorClasses(feature.color)} border-2 rounded-lg p-4 hover:shadow-lg transition-all transform hover:scale-105 group text-left`}
              >
                {/* Premium Badge */}
                {feature.status === 'premium' && (
                  <div className="inline-block mb-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    ✨ Premium
                  </div>
                )}

                {/* Icon */}
                <div className="text-3xl mb-2">{feature.icon}</div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 group-hover:underline mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">{feature.titleHi}</p>

                {/* Description */}
                <p className="text-sm text-gray-700 leading-snug">
                  {feature.desc}
                </p>

                {/* Arrow */}
                <div className="mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
        <div className="text-center">
          <p className="text-3xl font-bold text-saffron-600">4,521</p>
          <p className="text-sm text-gray-600 mt-1">केस हल किए गए</p>
        </div>
        <div className="text-center border-l border-r border-gray-300">
          <p className="text-3xl font-bold text-green-600">87%</p>
          <p className="text-sm text-gray-600 mt-1">सफलता दर</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">500+</p>
          <p className="text-sm text-gray-600 mt-1">गांवों तक पहुंचे</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
