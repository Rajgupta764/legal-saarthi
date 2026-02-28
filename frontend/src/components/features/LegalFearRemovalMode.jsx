import { useState, useEffect } from 'react'
import api from '../../services/api'

const LegalFearRemovalMode = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [topicData, setTopicData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [features, setFeatures] = useState([])

  // Fetch all features on mount
  useEffect(() => {
    fetchFearRemovalMode()
  }, [])

  const fetchFearRemovalMode = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/legal-education/fear-removal-mode')
      if (response.data.success) {
        setFeatures(response.data.data.features)
        setActiveTab('overview')
      }
    } catch (err) {
      console.error('Error fetching fear removal mode:', err)
      setError('Unable to load legal information')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTopic = async (topicId) => {
    try {
      setIsLoading(true)
      const response = await api.get(`/legal-education/topic/${topicId}`)
      if (response.data.success) {
        setTopicData(response.data.data)
        setSelectedTopic(topicId)
        setActiveTab('topic')
        window.scrollTo(0, 0)
      }
    } catch (err) {
      console.error('Error fetching topic:', err)
      setError('Unable to load this topic')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchKeyword.trim()) return

    try {
      setIsLoading(true)
      const response = await api.post('/legal-education/search', {
        keyword: searchKeyword
      })
      if (response.data.success) {
        setSearchResults(response.data.results)
        setActiveTab('search')
      }
    } catch (err) {
      console.error('Error searching:', err)
      setError('Unable to search legal information')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (sectionIndex) => {
    setExpandedSection(expandedSection === sectionIndex ? null : sectionIndex)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">⚖️</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Legal Fear Removal Mode</h1>
          <p className="text-xl text-gray-600 mb-2">कानूनी भय को ख़त्म करें</p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            साधारण भाषा में जानें कि आपके कानूनी अधिकार क्या हैं, पुलिस क्या कर सकती है, और FIR कैसे दर्ज करते हैं।
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="अपनी कानूनी समस्या खोजें... Search your legal concern..."
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                खोजें
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">लोड हो रहा है...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 flex-wrap justify-center">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500'
                }`}
              >
                मुख्य विषय
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === 'faq'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500'
                }`}
              >
                सामान्य प्रश्न
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && !selectedTopic && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    onClick={() => fetchTopic(feature.id)}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer transform hover:scale-105"
                  >
                    <div className="p-8 text-center">
                      <div className="text-5xl mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.titleHi}</h3>
                      <p className="text-sm text-gray-600 mb-4">{feature.title}</p>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Topic Detail Tab */}
            {activeTab === 'topic' && topicData && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <button
                  onClick={() => {
                    setActiveTab('overview')
                    setSelectedTopic(null)
                  }}
                  className="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
                >
                  ← वापस जाएं
                </button>

                <h2 className="text-3xl font-bold text-gray-800 mb-2">{topicData.title}</h2>
                <p className="text-gray-600 text-lg mb-6">{topicData.titleEn}</p>
                <p className="text-gray-700 mb-8">{topicData.summary}</p>

                {/* Sections */}
                <div className="space-y-4">
                  {topicData.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={() => toggleSection(sectionIndex)}
                        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-lg text-gray-800 transition"
                      >
                        <span>{section.heading}</span>
                        <span className="text-2xl">
                          {expandedSection === sectionIndex ? '−' : '+'}
                        </span>
                      </button>

                      {expandedSection === sectionIndex && (
                        <div className="p-6 border-t-2 border-gray-300">
                          {section.points.map((point, pointIndex) => (
                            <div key={pointIndex} className="mb-6 last:mb-0">
                              <h4 className="font-bold text-gray-800 mb-2 text-lg">
                                {point.title}
                              </h4>
                              {point.titleEn && (
                                <p className="text-sm text-blue-600 mb-3">{point.titleEn}</p>
                              )}
                              <p className="text-gray-700 mb-3 leading-relaxed">
                                {point.description}
                              </p>
                              {point.descriptionEn && (
                                <p className="text-gray-600 text-sm mb-3 italic">
                                  {point.descriptionEn}
                                </p>
                              )}
                              {point.law && (
                                <div className="bg-gray-100 border-l-4 border-blue-500 px-4 py-2 text-sm text-gray-700">
                                  <strong>कानून:</strong> {point.law}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Tab */}
            {activeTab === 'search' && searchResults && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  "{searchKeyword}" के लिए परिणाम
                </h2>
                {searchResults.length > 0 ? (
                  <div className="space-y-6">
                    {searchResults.map((result, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-6 py-4">
                        {result.matchType === 'point' ? (
                          <div>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">
                              {result.content.title}
                            </h4>
                            <p className="text-gray-700 mb-3">{result.content.description}</p>
                            {result.content.law && (
                              <div className="bg-blue-50 px-4 py-2 rounded text-sm text-blue-800">
                                <strong>कानून:</strong> {result.content.law}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">
                              {result.content.title}
                            </h4>
                            <button
                              onClick={() => fetchTopic(result.topic)}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              पूरा विषय पढ़ें →
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">कोई परिणाम नहीं मिले। कृपया दूसरे शब्द आजमाएं।</p>
                )}
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && !selectedTopic && (
              <CommonQuestions />
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-12 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-2">⚠️ महत्वपूर्ण नोट</h3>
          <p className="text-gray-700 mb-2">
            यह जानकारी सामान्य शिक्षा के उद्देश्य से दी गई है। कानूनी सलाह के लिए किसी योग्य वकील से संपर्क करें।
          </p>
          <p className="text-sm text-gray-600">
            Information based on: Indian Constitution, Police Act 1861, CrPC 1973, and IPC 1860
          </p>
        </div>
      </div>
    </div>
  )
}

const CommonQuestions = () => {
  const [expandedQ, setExpandedQ] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await api.get('/legal-education/common-questions')
      if (response.data.success) {
        setFaqs(response.data.data.questions)
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">आम सवालों के जवाब</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-2 border-gray-300 rounded-lg">
            <button
              onClick={() => setExpandedQ(expandedQ === index ? null : index)}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-800 transition text-left"
            >
              <span className="flex-1">{faq.question}</span>
              <span className="text-2xl ml-4">
                {expandedQ === index ? '−' : '+'}
              </span>
            </button>

            {expandedQ === index && (
              <div className="p-6 border-t-2 border-gray-300">
                <p className="text-gray-700 mb-4 leading-relaxed">{faq.answer}</p>
                {faq.answerEn && (
                  <p className="text-gray-600 text-sm italic mb-4">{faq.answerEn}</p>
                )}
                {faq.law && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 text-sm text-blue-800">
                    <strong>कानून:</strong> {faq.law}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LegalFearRemovalMode
