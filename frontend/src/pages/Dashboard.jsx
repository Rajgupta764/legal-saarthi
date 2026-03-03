import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { navigationStructure } from '../config/navigationConfig'
import DashboardHome from '../components/features/DashboardHome'
import VoiceComplaint from '../components/features/VoiceComplaint'
import LegalHelpFinder from '../components/features/LegalHelpFinder'
import DocumentUpload from '../components/features/DocumentUpload'
import DraftGenerator from '../components/features/DraftGenerator'
import SchemeMatcher from '../components/features/SchemeMatcher'
import LegalFearRemovalMode from '../components/features/LegalFearRemovalMode'
import Chatbot from '../components/features/Chatbot'
import VoiceAssistant from '../components/features/VoiceAssistant'
import CaseAnalytics from '../components/features/CaseAnalytics'
import LegalTipsWidget from '../components/features/LegalTipsWidget'
import CommunityQA from '../components/features/CommunityQA'
import EmergencyContact from '../components/features/EmergencyContact'
import UserProgressTracker from '../components/features/UserProgressTracker'
import DocumentManager from '../components/features/DocumentManager'
import LawyerNetwork from '../components/features/LawyerNetwork'

const Dashboard = () => {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'home'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState('coreTools')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const menuItems = [
    {
      id: 'document',
      label: 'Document Check',
      labelHi: 'दस्तावेज़ जांचें',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'voice',
      label: 'Voice Complaint',
      labelHi: 'आवाज़ से बताएं',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      id: 'helpfinder',
      label: 'Find Help',
      labelHi: 'सहायता खोजें',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'draft',
      label: 'Draft Generator',
      labelHi: 'FIR और आवेदन पत्र',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'schemes',
      label: 'Scheme Matcher',
      labelHi: 'सरकारी योजना मिलान',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-2.761 0-5 2.015-5 4.5S9.239 17 12 17s5-2.015 5-4.5S14.761 8 12 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v3m0 12v3m-9-9h3m12 0h3m-2.636-6.364l-2.121 2.121m-8.486 8.486l-2.121 2.121m0-12.728l2.121 2.121m8.486 8.486l2.121 2.121" />
        </svg>
      )
    },
    {
      id: 'fear-removal',
      label: 'Legal Rights Guide',
      labelHi: 'कानूनी संरक्षण गाइड',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'voice-assistant',
      label: 'Voice Assistant',
      labelHi: '🎙️ आवाज़ सहायक',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      id: 'chatbot',
      label: 'Text Assistant',
      labelHi: '💬 चैट सहायक',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Case Analytics',
      labelHi: '📊 केस विश्लेषण',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'tips',
      label: 'Legal Tips',
      labelHi: '💡 कानूनी सुझाव',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'community-qa',
      label: 'Q&A Community',
      labelHi: '💬 समुदाय सवाल-जवाब',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    },
    {
      id: 'emergency',
      label: 'Emergency Help',
      labelHi: '📞 आपातकालीन सेवा',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },
    {
      id: 'progress',
      label: 'My Progress',
      labelHi: '🏅 मेरी प्रगति',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      )
    },
    {
      id: 'documents',
      label: 'My Documents',
      labelHi: '📁 मेरे दस्तावेज़',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      id: 'lawyers',
      label: 'Lawyer Network',
      labelHi: '⚖️ वकील नेटवर्क',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 8.308 4 4 0 010-8.308M15 21H9a6 6 0 01-6-6v-1h18v1a6 6 0 01-6 6z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚖️</span>
            </div>
            <span className="font-semibold text-gray-800">Legal Saathi</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* User Avatar */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || '👤'}
                    </span>
                  </div>
                  {/* Online Status Indicator */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </button>
              
              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    लॉगआउट
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-60 bg-white border-r border-gray-200
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Sidebar Header */}
          <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚖️</span>
              </div>
              <span className="font-semibold text-gray-800">Legal Saathi</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col overflow-y-auto" style={{ height: 'calc(100vh - 56px - 60px)' }}>
            {/* Home Button */}
            <button
              onClick={() => {
                setActiveTab('home')
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
                transition-colors duration-150 border-l-4
                ${activeTab === 'home' 
                  ? 'bg-saffron-50 text-saffron-700 border-saffron-700' 
                  : 'text-gray-600 border-transparent hover:bg-gray-50'}
              `}
            >
              <span className="text-lg">🏠</span>
              <span>Dashboard</span>
            </button>

            {/* Category Groups */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {Object.entries(navigationStructure).map(([categoryKey, category]) => {
                if (categoryKey === 'futureModules' || category.features.length === 0) return null
                const isExpanded = expandedCategory === categoryKey
                const categoryFeatures = category.features.filter(f => 
                  menuItems.some(m => m.id === f.id)
                )
                
                if (categoryFeatures.length === 0) return null

                return (
                  <div key={categoryKey}>
                    {/* Category Collapse Header */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors uppercase"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="flex-1 text-left">{category.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Feature Items */}
                    {isExpanded && (
                      <div className="mt-1 space-y-1 ml-2 border-l-2 border-gray-200 pl-2">
                        {categoryFeatures.map((feature) => {
                          const menuItem = menuItems.find(m => m.id === feature.id)
                          if (!menuItem) return null
                          
                          return (
                            <button
                              key={feature.id}
                              onClick={() => {
                                setActiveTab(feature.id)
                                setSidebarOpen(false)
                              }}
                              className={`
                                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                                transition-colors duration-150 border-l-2
                                ${activeTab === feature.id
                                  ? 'bg-saffron-50 text-saffron-700 font-medium border-saffron-700'
                                  : 'text-gray-600 border-transparent hover:bg-gray-50'}
                              `}
                            >
                              <span className="text-base">{menuItem.icon}</span>
                              <span className="text-xs">{feature.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>होम पर जाएं</span>
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeTab === 'home' 
                    ? '🏠 आपकी कानूनी सहायता डैशबोर्ड'
                    : menuItems.find(item => item.id === activeTab)?.label || 'Features'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {activeTab === 'home'
                    ? '📊 अपने सभी कानूनी उपकरण और सेवाओं को खोजें'
                    : menuItems.find(item => item.id === activeTab)?.labelHi || ''}
                </p>
              </div>

              {/* Desktop User Profile - Hidden on Mobile */}
              <div className="hidden lg:block relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-lg font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || '👤'}
                      </span>
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Desktop User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      {user?.phone && <p className="text-xs text-gray-500 mt-1">{user?.phone}</p>}
                    </div>
                    <div className="py-1">
                      <Link
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        होम पेज
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        लॉगआउट करें
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'home' && (
              <DashboardHome 
                onSelectFeature={setActiveTab}
                activeTab={activeTab}
              />
            )}
            {activeTab === 'document' && <DocumentUpload />}
            {activeTab === 'voice' && <VoiceComplaint />}
            {activeTab === 'helpfinder' && <LegalHelpFinder />}
            {activeTab === 'draft' && <DraftGenerator />}
            {activeTab === 'schemes' && <SchemeMatcher />}
            {activeTab === 'fear-removal' && <LegalFearRemovalMode />}
            {activeTab === 'voice-assistant' && <VoiceAssistant autoStart={true} />}
            {activeTab === 'chatbot' && <Chatbot autoStart={true} />}
            {activeTab === 'analytics' && <CaseAnalytics />}
            {activeTab === 'tips' && <LegalTipsWidget />}
            {activeTab === 'community-qa' && <CommunityQA />}
            {activeTab === 'emergency' && <EmergencyContact />}
            {activeTab === 'progress' && <UserProgressTracker />}
            {activeTab === 'documents' && <DocumentManager />}
            {activeTab === 'lawyers' && <LawyerNetwork />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
